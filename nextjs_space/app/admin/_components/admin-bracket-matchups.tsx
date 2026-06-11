'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/flag-image';
import { toast } from 'sonner';
import { Save, Swords } from 'lucide-react';

const MATCH_COUNT = 16;

interface Matchup { round: string; matchIndex: number; teamA: string; teamB: string; }

export function AdminBracketMatchups() {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      const arr = Array.isArray(data) ? data : [];
      const teams: string[] = [];
      for (const g of arr) for (const t of (g?.teams ?? [])) teams.push(t?.name ?? '');
      setAllTeams(teams.filter(Boolean).sort());
    }).catch(() => {});
    fetch('/api/admin/bracket-matchups').then(r => r.json()).then((d: any) => {
      setMatchups(Array.isArray(d) ? d.filter((m: any) => m.round === 'ROUND_OF_32') : []);
    }).catch(() => {});
  }, []);

  const get = (idx: number, side: 'teamA' | 'teamB') =>
    matchups.find(m => m.matchIndex === idx)?.[side] ?? '';

  const set = (idx: number, side: 'teamA' | 'teamB', val: string) => {
    setMatchups(prev => {
      const existing = prev.find(m => m.matchIndex === idx);
      if (existing) {
        return prev.map(m => m.matchIndex === idx ? { ...m, [side]: val } : m);
      }
      return [...prev, { round: 'ROUND_OF_32', matchIndex: idx, teamA: side === 'teamA' ? val : '', teamB: side === 'teamB' ? val : '' }];
    });
  };

  const save = async (idx: number) => {
    const m = matchups.find(x => x.matchIndex === idx);
    if (!m || !m.teamA || !m.teamB) { toast.error('Selecciona ambos equipos'); return; }
    setSaving(idx);
    try {
      const res = await fetch('/api/admin/bracket-matchups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round: 'ROUND_OF_32', matchIndex: idx, teamA: m.teamA, teamB: m.teamB }),
      });
      if (res.ok) toast.success('Enfrentamiento guardado');
      else toast.error('Error al guardar');
    } catch { toast.error('Error'); }
    finally { setSaving(null); }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
        <Swords className="h-5 w-5" /> Enfrentamientos de Dieciseisavos
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Define qué dos equipos se enfrentan en cada uno de los 16 partidos. Una vez guardados, los usuarios podrán elegir el ganador.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: MATCH_COUNT }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Partido {idx + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(['teamA', 'teamB'] as const).map((side) => (
                <div key={side} className="flex items-center gap-2">
                  <select
                    className="flex-1 p-2 rounded-md border border-input bg-background text-sm"
                    value={get(idx, side)}
                    onChange={(e) => set(idx, side, e.target.value)}
                  >
                    <option value="">Seleccionar equipo...</option>
                    {allTeams.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {get(idx, side) && <FlagImage teamName={get(idx, side)} size={24} />}
                </div>
              ))}
              <Button size="sm" onClick={() => save(idx)} disabled={saving === idx} className="w-full gap-2">
                <Save className="h-4 w-4" /> {saving === idx ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
