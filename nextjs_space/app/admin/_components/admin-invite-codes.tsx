'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Trash2, Ticket } from 'lucide-react';

interface InviteCode {
  id: string;
  code: string;
  note: string;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

export function AdminInviteCodes() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const r = await fetch('/api/admin/invite-codes');
    if (r.ok) setCodes(await r.json());
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/invite-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, note }),
    });
    setLoading(false);
    if (r.ok) {
      toast.success(`${count} código(s) creado(s)`);
      setNote('');
      load();
    } else {
      toast.error('Error al crear códigos');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Borrar este código?')) return;
    const r = await fetch('/api/admin/invite-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (r.ok) { toast.success('Borrado'); load(); }
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copiado al portapapeles');
  };

  const pending = codes.filter(c => !c.usedBy);
  const used = codes.filter(c => c.usedBy);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5" />Generar códigos de invitación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Solo quién tenga un código válido podrá registrarse. Cada código es de un solo uso.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Cantidad</Label>
              <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} />
            </div>
            <div className="md:col-span-2">
              <Label>Nota (opcional)</Label>
              <Input placeholder="Ej: Para amigos del trabajo" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <Button onClick={generate} disabled={loading}>Generar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Códigos disponibles ({pending.length})</CardTitle></CardHeader>
        <CardContent>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">No hay códigos disponibles.</p>}
          <div className="space-y-2">
            {pending.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <code className="px-2 py-1 rounded bg-muted font-mono text-sm font-semibold">{c.code}</code>
                  {c.note && <span className="text-sm text-muted-foreground truncate">{c.note}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" onClick={() => copy(c.code)}><Copy className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {used.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Códigos usados ({used.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {used.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                    <code className="px-2 py-1 rounded bg-muted font-mono text-sm line-through opacity-60">{c.code}</code>
                    <Badge variant="destructive" className="whitespace-nowrap">Caducado</Badge>
                    <span className="text-sm text-muted-foreground">
                      Usado por <strong>{c.usedBy}</strong>
                      {c.usedAt && <> el {new Date(c.usedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                    </span>
                    {c.note && <span className="text-xs text-muted-foreground/60 truncate">({c.note})</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
