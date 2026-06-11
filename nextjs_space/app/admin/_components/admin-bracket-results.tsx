'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/flag-image';
import { toast } from 'sonner';
import { Save, Trophy } from 'lucide-react';
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/scoring';

const MATCH_COUNTS: Record<string, number> = {
  ROUND_OF_32: 16, ROUND_OF_16: 8, QUARTER_FINALS: 4, SEMI_FINALS: 2, FINAL: 1, THIRD_PLACE: 1,
};

interface BracketResult { round: string; matchIndex: number; teamName: string; scoreA?: number | null; scoreB?: number | null; }

export function AdminBracketResults() {
  const [results, setResults] = useState<BracketResult[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState('ROUND_OF_32');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      const arr = Array.isArray(data) ? data : [];
      const teams: string[] = [];
      for (const g of arr) for (const t of (g?.teams ?? [])) teams.push(t?.name ?? '');
      setAllTeams(teams.filter(Boolean));
    }).catch(() => {});
    fetch('/api/results/bracket').then(r => r.json()).then((data: any) => {
      setResults(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const getEntry = (round: string, matchIndex: number) => {
    return results.find((r: BracketResult) => r.round === round && r.matchIndex === matchIndex);
  };
  const getResult = (round: string, matchIndex: number) => getEntry(round, matchIndex)?.teamName ?? '';

  const setResult = (round: string, matchIndex: number, teamName: string) => {
    setResults(prev => {
      const filtered = prev.filter((r: BracketResult) => !(r.round === round && r.matchIndex === matchIndex));
      if (teamName) filtered.push({ round, matchIndex, teamName });
      return filtered;
    });
  };

  const setScore = (round: string, matchIndex: number, side: 'A' | 'B', value: number | null) => {
    setResults(prev => prev.map(r => {
      if (r.round === round && r.matchIndex === matchIndex) {
        return side === 'A' ? { ...r, scoreA: value } : { ...r, scoreB: value };
      }
      return r;
    }));
  };

  const saveResult = async (round: string, matchIndex: number) => {
    const entry = getEntry(round, matchIndex);
    if (!entry?.teamName) { toast.error('Selecciona un equipo'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/results/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round, matchIndex, teamName: entry.teamName, scoreA: entry.scoreA ?? null, scoreB: entry.scoreB ?? null }),
      });
      if (res.ok) toast.success('Resultado guardado');
      else toast.error('Error al guardar');
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };

  const matchCount = MATCH_COUNTS[activeRound] ?? 0;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Resultados reales - Eliminatorias</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {ROUND_ORDER.map((round: string) => (
          <Button key={round} variant={activeRound === round ? 'default' : 'outline'} size="sm" onClick={() => setActiveRound(round)}>
            {ROUND_LABELS[round] ?? round}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: matchCount }).map((_, idx) => (
          <Card key={`${activeRound}-${idx}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                {activeRound === 'FINAL' && <Trophy className="h-4 w-4 text-yellow-500" />}
                {ROUND_LABELS[activeRound]} - Partido {idx + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-2 rounded-md border border-input bg-background text-sm"
                  value={getResult(activeRound, idx)}
                  onChange={(e) => setResult(activeRound, idx, e.target.value)}
                >
                  <option value="">Seleccionar ganador...</option>
                  {allTeams.map((team: string) => <option key={team} value={team}>{team}</option>)}
                </select>
                <Button size="sm" onClick={() => saveResult(activeRound, idx)} disabled={saving}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              {getResult(activeRound, idx) && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-primary/10 rounded-md">
                  <FlagImage teamName={getResult(activeRound, idx)} size={18} />
                  <span className="text-sm font-medium flex-1">{getResult(activeRound, idx)}</span>
                </div>
              )}
              {getResult(activeRound, idx) && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span>Marcador:</span>
                  <input type="number" min={0} max={99} placeholder="Eq.A" value={getEntry(activeRound, idx)?.scoreA ?? ''}
                    onChange={(e) => setScore(activeRound, idx, 'A', e.target.value === '' ? null : parseInt(e.target.value))}
                    className="w-12 h-7 text-center text-xs border rounded bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span>-</span>
                  <input type="number" min={0} max={99} placeholder="Eq.B" value={getEntry(activeRound, idx)?.scoreB ?? ''}
                    onChange={(e) => setScore(activeRound, idx, 'B', e.target.value === '' ? null : parseInt(e.target.value))}
                    className="w-12 h-7 text-center text-xs border rounded bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
