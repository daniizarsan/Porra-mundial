'use client';
import { FlagImage } from '@/components/flag-image';
import { teamAbbr } from '@/components/team-code';
import { ROUND_LABELS, MATCH_COUNTS } from '@/lib/scoring';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useState } from 'react';

interface BracketPred {
  round: string;
  matchIndex: number;
  teamName: string;
  scoreA?: number | null;
  scoreB?: number | null;
}

interface Matchup { teamA: string | null; teamB: string | null; }

const ROUNDS = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];

export function BracketTree({
  predictions,
  baseMatchups,
  actualResults,
}: {
  predictions: BracketPred[];
  baseMatchups: Matchup[];
  actualResults?: Record<string, string>;
}) {
  const [windowStart, setWindowStart] = useState(0);
  const visibleCount = 3;

  const getPred = (round: string, matchIndex: number) =>
    predictions.find(p => p.round === round && p.matchIndex === matchIndex);

  const getMatchup = (round: string, matchIndex: number): Matchup => {
    if (round === 'ROUND_OF_32') {
      return baseMatchups[matchIndex] ?? { teamA: null, teamB: null };
    }
    const prevRoundIdx = ROUNDS.indexOf(round) - 1;
    if (prevRoundIdx < 0) return { teamA: null, teamB: null };
    const prevRound = ROUNDS[prevRoundIdx];
    const teamA = getPred(prevRound, matchIndex * 2)?.teamName ?? null;
    const teamB = getPred(prevRound, matchIndex * 2 + 1)?.teamName ?? null;
    return { teamA, teamB };
  };

  const visibleRounds = ROUNDS.slice(windowStart, windowStart + visibleCount);
  const canPrev = windowStart > 0;
  const canNext = windowStart + visibleCount < ROUNDS.length;
  const baseHeight = 3.5;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => canPrev && setWindowStart(s => Math.max(0, s - 1))}
          disabled={!canPrev}
          className="p-1.5 rounded-full border bg-background hover:bg-muted disabled:opacity-30 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${visibleRounds.length}, minmax(0, 1fr))` }}>
          {visibleRounds.map(r => (
            <div key={r} className="text-center text-xs font-semibold flex items-center justify-center gap-1">
              {r === 'FINAL' && <Trophy className="h-3 w-3 text-yellow-500" />}
              {ROUND_LABELS[r]}
            </div>
          ))}
        </div>
        <button
          onClick={() => canNext && setWindowStart(s => Math.min(ROUNDS.length - visibleCount, s + 1))}
          disabled={!canNext}
          className="p-1.5 rounded-full border bg-background hover:bg-muted disabled:opacity-30 shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${visibleRounds.length}, minmax(140px, 1fr))` }}>
          {visibleRounds.map((round, colIdx) => {
            const count = MATCH_COUNTS[round] ?? 0;
            const matchHeight = baseHeight * Math.pow(2, colIdx);

            return (
              <div
                key={round}
                className="flex flex-col"
                style={{ gap: `${matchHeight - baseHeight + 0.5}rem`, paddingTop: `${(matchHeight - baseHeight) / 2}rem` }}
              >
                {Array.from({ length: count }).map((_, idx) => {
                  const m = getMatchup(round, idx);
                  const pred = getPred(round, idx);
                  const actualWinner = actualResults?.[`${round}_${idx}`];
                  const isCorrect = actualWinner && pred?.teamName === actualWinner;
                  const isWrong = actualWinner && pred?.teamName && pred.teamName !== actualWinner;

                  return (
                    <div
                      key={`${round}-${idx}`}
                      className={`rounded-md border overflow-hidden text-xs ${
                        round === 'FINAL' ? 'border-yellow-500/40' : ''
                      }`}
                      style={{ minHeight: `${baseHeight}rem` }}
                    >
                      {[m.teamA, m.teamB].map((team, ti) => {
                        const isSelected = team && pred?.teamName === team;
                        return (
                          <div
                            key={ti}
                            className={`flex items-center gap-1.5 px-2 py-1 border-b last:border-b-0 ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-green-500/15 border-l-2 border-l-green-500 font-semibold'
                                  : isWrong
                                    ? 'bg-red-500/15 border-l-2 border-l-red-500 font-semibold'
                                    : 'bg-primary/15 border-l-2 border-l-primary font-semibold'
                                : 'opacity-50'
                            }`}
                          >
                            {team ? (
                              <>
                                <FlagImage teamName={team} size={16} />
                                <span className="font-mono text-[10px] font-semibold flex-1">{teamAbbr(team)}</span>
                                {isSelected && pred?.scoreA !== undefined && pred?.scoreA !== null && (
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    {ti === 0 ? pred.scoreA : pred.scoreB}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="italic opacity-40 text-[10px]">TBD</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
