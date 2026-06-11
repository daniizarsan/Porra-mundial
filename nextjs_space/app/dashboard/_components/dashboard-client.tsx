'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, Users, ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUND_LABELS } from '@/lib/scoring';

interface LeaderboardEntry {
  userId: string;
  firstName: string;
  alias: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  groupPoints: number;
  bracketPoints: number;
  breakdown: Record<string, number>;
}

interface DeadlineEntry {
  phase: string;
  closesAt: string;
  label: string;
}

export function DashboardClient() {
  const { data: session } = useSession() || {};
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState(0);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then((data: any) => {
      const arr = data?.entries ?? (Array.isArray(data) ? data : []);
      setLeaderboard(arr);
      const userId = (session?.user as any)?.id;
      const idx = arr.findIndex((e: any) => e?.userId === userId);
      if (idx >= 0) {
        setMyRank(idx + 1);
        setMyPoints(arr[idx]?.totalPoints ?? 0);
      }
    }).catch(() => {});
    fetch('/api/deadlines').then(r => r.json()).then((data: any) => {
      setDeadlines(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, [session]);

  const nextDeadline = deadlines.find((d: DeadlineEntry) => new Date(d.closesAt) > new Date());
  const userName = (session?.user as any)?.firstName ?? session?.user?.name ?? 'Jugador';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            ¡Hola, <span className="text-primary">{userName}</span>! ⚽
          </h1>
          <p className="text-muted-foreground mb-8">Tu panel de predicciones del Mundial 2026</p>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tus puntos</p>
                    <p className="text-3xl font-bold font-mono">{myPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <BarChart3 className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tu posición</p>
                    <p className="text-3xl font-bold font-mono">{myRank ?? '-'}<span className="text-base text-muted-foreground">/{leaderboard?.length ?? 0}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <Clock className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo cierre</p>
                    <p className="text-lg font-semibold">{nextDeadline?.label ?? 'Sin fechas'}</p>
                    {nextDeadline && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(nextDeadline.closesAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Target className="h-5 w-5 text-primary" /> Predicciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Haz o edita tus predicciones para la fase de grupos y el cuadro eliminatorio.
                </p>
                <Link href="/predictions">
                  <Button className="gap-2">
                    Ir a predicciones <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Trophy className="h-5 w-5 text-secondary" /> Clasificación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Consulta la tabla de posiciones y compara tus predicciones con las de otros.
                </p>
                <Link href="/leaderboard">
                  <Button variant="secondary" className="gap-2">
                    Ver clasificación <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top 5 Leaderboard preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Users className="h-5 w-5" /> Top 5 Clasificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(leaderboard?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay puntuaciones. ¡El torneo no ha empezado!</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry: LeaderboardEntry, i: number) => (
                    <div key={entry?.userId ?? i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold text-lg w-8 text-center ${
                          i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-muted-foreground'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-medium">{entry?.alias || entry?.firstName || 'Jugador'}</span>
                      </div>
                      <span className="font-mono font-bold text-primary">{entry?.totalPoints ?? 0} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
