'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Trophy, Mail, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        toast.error('Email o contraseña incorrectos');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) { toast.error('Escribe tu email'); return; }
    setResetSending(true);
    try {
      await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), message: resetMsg.trim() }),
      });
      setResetSent(true);
      toast.success('Solicitud enviada. El administrador la revisará pronto.');
    } catch {
      toast.error('Error al enviar');
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-7 w-7 text-primary" />
            <CardTitle className="font-display text-2xl tracking-tight">
              Porra <span className="text-primary">Mundial</span>
            </CardTitle>
          </div>
          <CardDescription>
            {showReset ? 'Solicita restablecer tu contraseña' : 'Inicia sesión para acceder a tus predicciones'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showReset ? (
            resetSent ? (
              <div className="text-center space-y-4 py-4">
                <KeyRound className="h-10 w-10 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Tu solicitud ha sido enviada. El administrador la revisará y te comunicará tu nueva contraseña.
                </p>
                <Button variant="outline" onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(''); setResetMsg(''); }}>
                  Volver al login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Tu email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="resetEmail" type="email" placeholder="tu@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resetMsg">Mensaje (opcional)</Label>
                  <Input id="resetMsg" placeholder="Explica tu situación..." value={resetMsg} onChange={(e) => setResetMsg(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={resetSending}>
                  {resetSending ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
                <Button variant="ghost" className="w-full" type="button" onClick={() => setShowReset(false)}>
                  Volver al login
                </Button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Iniciar sesión'}
                </Button>
              </form>
              <div className="mt-3 text-center">
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors" onClick={() => setShowReset(true)}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                ¿No tienes cuenta?{' '}
                <Link href="/signup" className="text-primary font-medium hover:underline">Regístrate</Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
