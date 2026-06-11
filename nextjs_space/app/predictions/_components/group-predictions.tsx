'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlagImage } from '@/components/flag-image';
import { teamDisplayName } from '@/components/team-code';
import { toast } from 'sonner';
import { Save, Lock, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface Team { id: string; name: string; code: string; flagUrl: string; }
interface GroupData { id: string; name: string; teams: Team[]; }

export function GroupPredictions() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [predictions, setPredictions] = useState<Record<string, string[]>>({});
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [locked, setLocked] = useState(false);
  const [wins, setWins] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);
  const dragInfo = useRef<{ groupId: string; index: number } | null>(null);

  useEffect(() => {
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      const arr = Array.isArray(data) ? data : [];
      setGroups(arr);
      const defaultPreds: Record<string, string[]> = {};
      for (const g of arr) defaultPreds[g.id] = (g?.teams ?? []).map((t: Team) => t.name);
      fetch('/api/predictions/groups').then(r => r.json()).then((preds: any) => {
        const predsArr = Array.isArray(preds) ? preds : [];
        const winsData: Record<string, Record<string, number>> = {};
        for (const p of predsArr) {
          try {
            const parsed = JSON.parse(p.positions);
            if (Array.isArray(parsed)) defaultPreds[p.groupId] = parsed;
          } catch {}
          if (p.wins) {
            try { winsData[p.groupId] = JSON.parse(p.wins); } catch {}
          }
        }
        setPredictions(defaultPreds);
        setWins(winsData);
      }).catch(() => setPredictions(defaultPreds));
    }).catch(() => {});

    fetch('/api/deadlines').then(r => r.json()).then((data: any) => {
      const arr = Array.isArray(data) ? data : [];
      const gd = arr.find((d: any) => d?.phase === 'GROUP_STAGE');
      if (gd) {
        const d = new Date(gd.closesAt);
        setDeadline(d);
        setLocked(new Date() > d);
      }
    }).catch(() => {});
  }, []);

  const moveTeam = useCallback((groupId: string, fromIndex: number, toIndex: number) => {
    if (locked) return;
    setPredictions(prev => {
      const current = [...(prev[groupId] ?? [])];
      if (toIndex < 0 || toIndex >= current.length || fromIndex === toIndex) return prev;
      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);
      return { ...prev, [groupId]: current };
    });
  }, [locked]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(predictions).map(([groupId, positions]) => ({
        groupId,
        positions: JSON.stringify(positions),
        wins: wins[groupId] ? JSON.stringify(wins[groupId]) : null,
      }));
      const res = await fetch('/api/predictions/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: payload }),
      });
      if (res.ok) toast.success('¡Predicciones de grupo guardadas!');
      else { const data = await res.json(); toast.error(data?.error ?? 'Error al guardar'); }
    } catch { toast.error('Error al guardar predicciones'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Arrastra los equipos para ordenarlos según tu predicción. Los 2 primeros clasifican.
          </p>
          {deadline && (
            <p className="text-xs text-muted-foreground mt-1">
              {locked ? (
                <span className="text-destructive flex items-center gap-1"><Lock className="h-3 w-3" /> Predicciones cerradas</span>
              ) : (
                <span>Cierre: {deadline.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              )}
            </p>
          )}
        </div>
        {!locked && (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group: GroupData, gi: number) => (
          <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">Grupo {group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {(predictions[group.id] ?? []).map((teamName: string, idx: number) => (
                    <div
                      key={teamName}
                      draggable={!locked}
                      onDragStart={() => { dragInfo.current = { groupId: group.id, index: idx }; }}
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const info = dragInfo.current;
                        if (info && info.groupId === group.id) moveTeam(group.id, info.index, idx);
                        dragInfo.current = null;
                      }}
                      className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors select-none ${
                        idx < 2 ? 'bg-green-500/15 border border-green-500/40 text-foreground' : 'bg-muted/60 border border-border text-foreground'
                      } ${!locked ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      {!locked && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className="font-mono text-xs w-5 text-muted-foreground">{idx + 1}.</span>
                      <FlagImage teamName={teamName} size={22} />
                      <span className="flex-1 font-medium truncate">{teamDisplayName(teamName)}</span>
                      {!locked && (
                        <div className="flex gap-0.5">
                          <button onClick={() => moveTeam(group.id, idx, idx - 1)} disabled={idx === 0}
                            className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs" aria-label="Subir">▲</button>
                          <button onClick={() => moveTeam(group.id, idx, idx + 1)} disabled={idx === (predictions[group.id]?.length ?? 0) - 1}
                            className="p-1 rounded hover:bg-muted disabled:opacity-30 text-xs" aria-label="Bajar">▼</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-2 text-center">Los 2 primeros clasifican →</p>
                {/* Wins prediction per team */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Nº de victorias por equipo</p>
                  <div className="space-y-1">
                    {(predictions[group.id] ?? []).map((teamName: string) => (
                      <div key={`wins-${teamName}`} className="flex items-center gap-2 text-xs">
                        <FlagImage teamName={teamName} size={16} />
                        <span className="flex-1 truncate">{teamDisplayName(teamName)}</span>
                        <input
                          type="number"
                          min={0}
                          max={3}
                          value={wins[group.id]?.[teamName] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                            setWins(prev => ({
                              ...prev,
                              [group.id]: {
                                ...(prev[group.id] ?? {}),
                                [teamName]: v !== undefined && !isNaN(v) ? v : 0,
                              },
                            }));
                          }}
                          disabled={locked}
                          placeholder="0"
                          className="w-10 h-6 text-center text-xs border rounded bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
