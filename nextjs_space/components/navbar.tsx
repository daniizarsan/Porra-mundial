'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Trophy, LogOut, Menu, X, Shield, BarChart3, Users, Target, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navbar() {
  const { data: session } = useSession() || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  if (!session) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/predictions', label: 'Predicciones', icon: Target },
    { href: '/leaderboard', label: 'Clasificación', icon: Trophy },
    { href: '/participants', label: 'Participantes', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="text-primary">Porra</span>
          <span className="text-secondary">Mundial</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                <l.icon className="h-4 w-4" /> {l.label}
              </Button>
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2 text-secondary">
                <Shield className="h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" /> Perfil
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </nav>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <l.icon className="h-4 w-4" /> {l.label}
              </Button>
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-secondary">
                <Shield className="h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          <Link href="/profile" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <User className="h-4 w-4" /> Perfil
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      )}
    </header>
  );
}
