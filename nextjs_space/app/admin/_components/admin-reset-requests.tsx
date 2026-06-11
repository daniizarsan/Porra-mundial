'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KeyRound, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ResetReq {
  id: string;
  userId: string;
  message: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string; alias: string | null };
}

export function AdminResetRequests() {
  const [requests, setRequests] = useState<ResetReq[]>([]);
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    fetch('/api/admin/reset-requests').then(r => r.json()).then((data: any) => {
      setRequests(Array.isArray(data) ? data : []);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (reqId: string, action: 'APPROVE' | 'DENY') => {
    if (action === 'APPROVE') {
      const pw = newPasswords[reqId];
      if (!pw || pw.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    }
    setProcessing(reqId);
    try {
      const res = await fetch('/api/admin/reset-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: reqId, action, newPassword: newPasswords[reqId] }),
      });
      if (res.ok) {
        toast.success(action === 'APPROVE' ? 'Contraseña restablecida' : 'Solicitud denegada');
        load();
      } else {
        const d = await res.json();
        toast.error(d?.error ?? 'Error');
      }
    } catch { toast.error('Error'); }
    finally { setProcessing(null); }
  };

  const pending = requests.filter(r => r.status === 'PENDING');
  const processed = requests.filter(r => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-yellow-500" />
            Solicitudes de Reseteo de Contraseña
            {pending.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pending.length} pendientes</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pending.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p>
          )}
          {pending.map((r) => (
            <div key={r.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{r.user.alias || r.user.firstName} {r.user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{r.user.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {r.message && <p className="text-sm text-muted-foreground italic">"{r.message}"</p>}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nueva contraseña (mín. 6 chars)"
                  value={newPasswords[r.id] ?? ''}
                  onChange={(e) => setNewPasswords(prev => ({ ...prev, [r.id]: e.target.value }))}
                  className="flex-1"
                  type="text"
                />
                <Button size="sm" onClick={() => handleAction(r.id, 'APPROVE')} disabled={processing === r.id} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-1" /> Aprobar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(r.id, 'DENY')} disabled={processing === r.id} className="text-destructive border-destructive/50">
                  <X className="h-4 w-4 mr-1" /> Denegar
                </Button>
              </div>
            </div>
          ))}

          {/* History */}
          {processed.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Historial</p>
              {processed.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{r.user.alias || r.user.firstName} ({r.user.email})</span>
                  <Badge variant={r.status === 'APPROVED' ? 'default' : 'secondary'}>
                    {r.status === 'APPROVED' ? 'Aprobada' : 'Denegada'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
