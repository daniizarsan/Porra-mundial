'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/flag-image';
import { teamDisplayName } from '@/components/team-code';
import { toast } from 'sonner';
import { Save, CheckCircle2 } from 'lucide-react';

interface Team { id: string; name: string; code: string; }
interface GroupData { id: string; name: string; teams: Team[]; }
interface ActualResult { groupId: string; positions: string; wins?: string | null; }

export function AdminResults() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [results, setResults] = useState<Record<string, string[]>>({});
  const [wins, setWins] = useState<Record<string, Record<string, number>>>({});
  const [existingResults, setExistingResults] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      const arr = Array.isArray(data) ? data : [];
      setGroups(arr);
      const defaults: Record<string, string[]> = {};
      for (const g of arr) {
        defaults[g.id] = (g?.teams ?? []).map((t: Team) => t.name);
      }
      fetch('/api/results/groups').then(r => r.json()).then((res: any) => {
        const resArr = Array.isArray(res) ? res : [];
        const existMap: Record<string, boolean> = {};
        const winsData: Record<string, Record<string, number>> = {};
        for (const r of resArr) {
          try {
            defaults[r.groupId] = JSON.parse(r.positions);
            existMap[r.groupId] = true;
          } catch {}
          if (r.wins) {
            try { winsData[r.groupId] = JSON.parse(r.wins); } catch {}
          }
        }
        setResults(defaults);
        setWins(winsData);
        setExistingResults(existMap);
      }).catch(() => setResults(defaults));
    }).catch(() => {});
  }, []);

  const moveTeam = useCallback((groupId: string, fromIndex: number, direction: 'up' | 'down') => {
    setResults(prev => {
      const current = [...(prev[groupId] ?? [])];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= current.length) return prev;
      [current[fromIndex], current[toIndex]] = [current[toIndex], current[fromIndex]];
      return { ...prev, [groupId]: current };
    });
  }, []);

  const saveGroup = async (groupId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/results/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, positions: JSON.stringify(results[groupId] ?? []), wins: wins[groupId] ? JSON.stringify(wins[groupId]) : null }),
      });
      if (res.ok) {
        toast.success('Resultado guardado');
        setExistingResults(prev => ({ ...prev, [groupId]: true }));
      } else {
        toast.error('Error al guardar');
      }
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Resultados reales - Fase de Grupos</h2>
      <p className="text-sm text-muted-foreground mb-6">Ordena los equipos seg\aún la clasificación final real de cada grupo y guarda.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group: GroupData) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-display">Grupo {group.name}</CardTitle>
              {existingResults[group.id] && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </CardHeader>
            <CardContent>
              <div className="space-y-1 mb-3">
                {(results[group.id] ?? []).map((teamName: string, idx: number) => (
                  <div key={teamName} className={`flex items-center gap-2 p-2 rounded-md text-sm ${idx < 2 ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <span className="font-mono text-xs w-5">{idx + 1}.</span>
                    <FlagImage teamName={teamName} size={20} />
                    <span className="flex-1 text-sm">{teamDisplayName(teamName)}</span>
                    <div className="flex gap-0.5">
                      <button onClick={() => moveTeam(group.id, idx, 'up')} disabled={idx === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs">▲</button>
                      <button onClick={() => moveTeam(group.id, idx, 'down')} disabled={idx === (results[group.id]?.length ?? 0) - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs">▼</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Wins per team */}
              <div className="mb-3 pt-3 border-t">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Nº de victorias real por equipo</p>
                <div className="space-y-1">
                  {(results[group.id] ?? []).map((teamName: string) => (
                    <div key={`wins-${teamName}`} className="flex items-center gap-2 text-xs">
                      <FlagImage teamName={teamName} size={16} />
                      <span className="flex-1 truncate">{teamDisplayName(teamName)}</span>
                      <input type="number" min={0} max={3}
                        value={wins[group.id]?.[teamName] ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          setWins(prev => ({ ...prev, [group.id]: { ...(prev[group.id] ?? {}), [teamName]: isNaN(v) ? 0 : v } }));
                        }}
                        placeholder="0"
                        className="w-10 h-6 text-center text-xs border rounded bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                  ))}
                </div>
              </div>
              <Button size="sm" className="w-full gap-2" onClick={() => saveGroup(group.id)} disabled={saving}>
                <Save className="h-3 w-3" /> Guardar resultado
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
