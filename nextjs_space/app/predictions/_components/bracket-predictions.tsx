'use client';
import { useEffect, useState, useCallback } from 'react';
import { FlagImage } from '@/components/flag-image';
import { teamAbbr } from '@/components/team-code';
import { toast } from 'sonner';
import { Lock, Trophy, ChevronLeft, ChevronRight, HelpCircle, Check } from 'lucide-react';
import { ROUND_LABELS, MATCH_COUNTS } from '@/lib/scoring';

interface BracketPred { round: string; matchIndex: number; teamName: string; scoreA?: number | null; scoreB?: number | null; }
interface DeadlineEntry { phase: string; closesAt: string; }
type Matchup = { teamA: string | null; teamB: string | null };

const ROUNDS = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

export function BracketPredictions() {
  const [predictions, setPredictions] = useState<BracketPred[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineEntry[]>([]);
  const [baseMatchups, setBaseMatchups] = useState<Matchup[]>([]); // R32 from admin
  const [saving, setSaving] = useState(false);
  const [windowStart, setWindowStart] = useState(0);
  const visibleCount = 3;

  useEffect(() => {
    fetch('/api/predictions/bracket').then(r => r.json()).then((d: any) => setPredictions(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/deadlines').then(r => r.json()).then((d: any) => setDeadlines(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/bracket-structure').then(r => r.json()).then((d: any) => {
      if (d && d['ROUND_OF_32']) setBaseMatchups(d['ROUND_OF_32']);
    }).catch(() => {});
  }, []);

  // All knockout rounds share a single deadline (ROUND_OF_32)
  const isRoundLocked = (_round: string) => {
    const dl = deadlines.find((d) => d.phase === 'ROUND_OF_32');
    return dl ? new Date() > new Date(dl.closesAt) : false;
  };

  const getPred = useCallback((round: string, matchIndex: number) =>
    predictions.find((p) => p.round === round && p.matchIndex === matchIndex)?.teamName ?? null
  , [predictions]);

  const getScores = useCallback((round: string, matchIndex: number) => {
    const p = predictions.find((pp) => pp.round === round && pp.matchIndex === matchIndex);
    return { scoreA: p?.scoreA ?? null, scoreB: p?.scoreB ?? null };
  }, [predictions]);

  const setScore = async (round: string, matchIndex: number, side: 'A' | 'B', value: number | null) => {
    if (isRoundLocked(round)) return;
    const pred = predictions.find(p => p.round === round && p.matchIndex === matchIndex);
    if (!pred) return; // must pick winner first
    const newScoreA = side === 'A' ? value : (pred.scoreA ?? null);
    const newScoreB = side === 'B' ? value : (pred.scoreB ?? null);
    setPredictions(prev => prev.map(p =>
      p.round === round && p.matchIndex === matchIndex ? { ...p, scoreA: newScoreA, scoreB: newScoreB } : p
    ));
    try {
      await fetch('/api/predictions/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: [{ round, matchIndex, teamName: pred.teamName, scoreA: newScoreA, scoreB: newScoreB }] }),
      });
    } catch {}
  };

  // Build full bracket from R32 base + user predictions cascading
  const getMatchup = useCallback((round: string, matchIndex: number): Matchup => {
    if (round === 'ROUND_OF_32') {
      return baseMatchups[matchIndex] ?? { teamA: null, teamB: null };
    }
    // Derive from previous round's predicted winners
    const prevRoundIdx = ROUNDS.indexOf(round) - 1;
    if (prevRoundIdx < 0) return { teamA: null, teamB: null };
    const prevRound = ROUNDS[prevRoundIdx];
    const teamA = getPred(prevRound, matchIndex * 2);
    const teamB = getPred(prevRound, matchIndex * 2 + 1);
    return { teamA, teamB };
  }, [baseMatchups, getPred]);

  // When picking a winner, also clear any downstream predictions that depended on the old pick
  const pickWinner = async (round: string, matchIndex: number, teamName: string) => {
    if (isRoundLocked(round)) { toast.error('Esta ronda está cerrada'); return; }

    const oldPick = getPred(round, matchIndex);
    if (oldPick === teamName) return; // same pick, ignore

    // Build list of predictions to remove (cascade): if user changes pick in round X,
    // any later rounds that had the old winner must be cleared
    const predsToRemove: { round: string; matchIndex: number }[] = [];
    if (oldPick) {
      // Walk forward through rounds and remove any prediction that references the old pick
      const roundIdx = ROUNDS.indexOf(round);
      for (let ri = roundIdx + 1; ri < ROUNDS.length; ri++) {
        const r = ROUNDS[ri];
        const count = MATCH_COUNTS[r] ?? 0;
        for (let mi = 0; mi < count; mi++) {
          const p = predictions.find(pp => pp.round === r && pp.matchIndex === mi);
          if (p && p.teamName === oldPick) {
            predsToRemove.push({ round: r, matchIndex: mi });
          }
        }
      }
    }

    // Update local state
    setPredictions(prev => {
      let updated = prev.filter(p => !(p.round === round && p.matchIndex === matchIndex));
      // Remove cascaded predictions
      for (const rm of predsToRemove) {
        updated = updated.filter(p => !(p.round === rm.round && p.matchIndex === rm.matchIndex));
      }
      return [...updated, { round, matchIndex, teamName }];
    });

    // Save to server
    setSaving(true);
    try {
      const existingPred = predictions.find(p => p.round === round && p.matchIndex === matchIndex);
      const allToSave = [{ round, matchIndex, teamName, scoreA: existingPred?.scoreA ?? null, scoreB: existingPred?.scoreB ?? null }];
      // Also delete cascaded from server by saving them with the "cleared" marker
      // Actually, we'll just save the new one and delete the old cascade
      const res = await fetch('/api/predictions/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: allToSave }),
      });
      // Delete cascaded predictions from server
      if (predsToRemove.length > 0) {
        await fetch('/api/predictions/bracket', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ predictions: predsToRemove }),
        });
      }
      if (res.ok) toast.success('Predicción guardada');
      else { const d = await res.json(); toast.error(d?.error ?? 'Error'); }
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const visibleRounds = ROUNDS.slice(windowStart, windowStart + visibleCount);
  const canPrev = windowStart > 0;
  const canNext = windowStart + visibleCount < ROUNDS.length;
  const baseHeight = 4.5;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        Haz clic en un equipo para elegirlo como ganador. El ganador avanza automáticamente a la siguiente ronda.
      </div>

      {/* Round headers with navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => canPrev && setWindowStart(s => Math.max(0, s - 1))}
          disabled={!canPrev}
          className="p-2 rounded-full border bg-background hover:bg-muted disabled:opacity-30 shrink-0"
          aria-label="Ronda anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${visibleRounds.length}, minmax(0, 1fr))` }}>
          {visibleRounds.map((r) => (
            <div key={r} className="text-center text-sm font-semibold flex items-center justify-center gap-2">
              {r === 'FINAL' && <Trophy className="h-4 w-4 text-yellow-500" />}
              {ROUND_LABELS[r]}
              {isRoundLocked(r) && <Lock className="h-3 w-3 text-destructive" />}
            </div>
          ))}
        </div>
        <button
          onClick={() => canNext && setWindowStart(s => Math.min(ROUNDS.length - visibleCount, s + 1))}
          disabled={!canNext}
          className="p-2 rounded-full border bg-background hover:bg-muted disabled:opacity-30 shrink-0"
          aria-label="Ronda siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Bracket grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${visibleRounds.length}, minmax(200px, 1fr))` }}>
          {visibleRounds.map((round, colIdx) => {
            const count = MATCH_COUNTS[round] ?? 0;
            const locked = isRoundLocked(round);
            const matchHeight = baseHeight * Math.pow(2, colIdx);

            return (
              <div
                key={round}
                className="flex flex-col"
                style={{
                  gap: `${matchHeight - baseHeight + 0.75}rem`,
                  paddingTop: `${(matchHeight - baseHeight) / 2}rem`,
                }}
              >
                {Array.from({ length: count }).map((_, idx) => {
                  const m = getMatchup(round, idx);
                  const pred = getPred(round, idx);
                  const ready = !!m.teamA && !!m.teamB;

                  const scores = getScores(round, idx);

                  return (
                    <MatchCard
                      key={`${round}-${idx}`}
                      matchup={m}
                      prediction={pred}
                      scoreA={scores.scoreA}
                      scoreB={scores.scoreB}
                      ready={ready}
                      locked={locked}
                      isFinal={round === 'FINAL'}
                      baseHeight={baseHeight}
                      onPick={(team) => pickWinner(round, idx, team)}
                      onScoreChange={(side, val) => setScore(round, idx, side, val)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  matchup,
  prediction,
  scoreA,
  scoreB,
  ready,
  locked,
  isFinal,
  baseHeight,
  onPick,
  onScoreChange,
}: {
  matchup: { teamA: string | null; teamB: string | null };
  prediction: string | null;
  scoreA: number | null;
  scoreB: number | null;
  ready: boolean;
  locked: boolean;
  isFinal: boolean;
  baseHeight: number;
  onPick: (team: string) => void;
  onScoreChange: (side: 'A' | 'B', value: number | null) => void;
}) {
  const scores = [scoreA, scoreB];
  const sides: ('A' | 'B')[] = ['A', 'B'];
  return (
    <div
      className={`rounded-lg border overflow-hidden shadow-sm transition-shadow ${
        isFinal ? 'border-yellow-500/50 shadow-yellow-500/10' : 'bg-card'
      }`}
      style={{ minHeight: `${baseHeight}rem` }}
    >
      {[matchup.teamA, matchup.teamB].map((team, ti) => {
        const isSelected = team && prediction === team;
        const isOther = prediction && team && prediction !== team;
        const disabled = !ready || locked || !team;

        return (
          <div key={ti} className={`flex items-center border-b last:border-b-0 ${
            isSelected
              ? 'bg-primary/20 border-l-4 border-l-primary font-semibold'
              : isOther
                ? 'opacity-40'
                : ''
          }`}>
            <button
              onClick={() => team && onPick(team)}
              disabled={disabled}
              className={`flex-1 flex items-center gap-2 px-2.5 py-2 text-sm transition-all ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'
              }`}
            >
              {team ? (
                <>
                  <FlagImage teamName={team} size={22} />
                  <span className="font-mono text-xs font-semibold flex-1 text-left">{teamAbbr(team)}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </>
              ) : (
                <>
                  <HelpCircle className="h-5 w-5 opacity-30" />
                  <span className="flex-1 text-left italic opacity-50 text-xs">Por determinar</span>
                </>
              )}
            </button>
            {prediction && team && (
              <input
                type="number"
                min={0}
                max={99}
                value={scores[ti] ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                  onScoreChange(sides[ti], v !== null && !isNaN(v) ? v : null);
                }}
                disabled={locked}
                placeholder="-"
                className="w-9 h-7 text-center text-xs border rounded mr-1.5 bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
