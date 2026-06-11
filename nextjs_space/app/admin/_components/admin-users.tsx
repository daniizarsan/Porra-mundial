'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, User, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { data: session } = useSession() || {};
  const currentUserId = (session?.user as any)?.id;

  const loadUsers = () => {
    fetch('/api/admin/users').then(r => r.json()).then((data: any) => {
      setUsers(Array.isArray(data) ? data : []);
    }).catch(() => {});
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (u: UserData) => {
    if (!confirm(`¿Eliminar al usuario ${u.firstName} ${u.lastName} (${u.email})?\n\nEsta acción borrará todas sus predicciones y no se puede deshacer.`)) return;
    setDeleting(u.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id }),
      });
      if (res.ok) {
        toast.success('Usuario eliminado');
        setUsers(prev => prev.filter(x => x.id !== u.id));
      } else {
        const d = await res.json();
        toast.error(d?.error ?? 'Error al eliminar');
      }
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-4">Usuarios Registrados</h2>
      <p className="text-sm text-muted-foreground mb-6">{users.length} usuarios registrados</p>
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {users.map((u: UserData, i: number) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  {u.role === 'ADMIN' ? (
                    <Shield className="h-4 w-4 text-secondary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {u.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('es-ES')}
                  </span>
                  {u.id !== currentUserId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      onClick={() => handleDelete(u)}
                      disabled={deleting === u.id}
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
