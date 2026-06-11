'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Clock, Save, CheckCircle2 } from 'lucide-react';

interface Deadline {
  id: string;
  phase: string;
  closesAt: string;
  label: string;
}

export function AdminDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/deadlines').then(r => r.json()).then((data: any) => {
      setDeadlines(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const updateDeadline = async (phase: string, closesAt: string) => {
    setSaving(phase);
    try {
      const res = await fetch('/api/deadlines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, closesAt }),
      });
      if (res.ok) {
        toast.success('Fecha actualizada');
      } else {
        toast.error('Error al actualizar');
      }
    } catch {
      toast.error('Error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Fechas de Cierre de Predicciones</h2>
      <p className="text-sm text-muted-foreground mb-6">Configura cuándo se cierran las predicciones para cada fase.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deadlines.map((dl: Deadline) => {
          const isClosed = new Date() > new Date(dl.closesAt);
          return (
            <Card key={dl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {dl.label || dl.phase}
                  {isClosed && <span className="text-xs text-destructive">(Cerrado)</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    defaultValue={new Date(dl.closesAt).toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const idx = deadlines.findIndex((d: Deadline) => d.phase === dl.phase);
                      if (idx >= 0) {
                        const updated = [...deadlines];
                        updated[idx] = { ...updated[idx], closesAt: new Date(e.target.value).toISOString() };
                        setDeadlines(updated);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateDeadline(dl.phase, dl.closesAt)}
                    disabled={saving === dl.phase}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
