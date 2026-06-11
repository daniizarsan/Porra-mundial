'use client';
import Link from 'next/link';
import { Trophy, Target, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const features = [
  { icon: Target, title: 'Haz tus predicciones', desc: 'Predice las posiciones de cada grupo y los ganadores de cada fase eliminatoria.' },
  { icon: BarChart3, title: 'Puntuación progresiva', desc: 'Gana más puntos por acertar las rondas más avanzadas del torneo.' },
  { icon: Users, title: 'Compite con amigos', desc: 'Sigue la clasificación en tiempo real y descubre quién es el mejor pronosticador.' },
  { icon: Trophy, title: 'Leaderboard en vivo', desc: 'Los puntos se calculan automáticamente seg\aún los resultados reales del Mundial.' },
];

export function LandingClient() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-stadium.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative max-w-[1200px] mx-auto px-4 py-32 md:py-48 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="h-10 w-10 text-yellow-400" />
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white">
                Porra <span className="text-green-400">Mundial</span> 2026
              </h1>
            </div>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Haz tus predicciones para el Mundial de Fútbol 2026 y compite con tus amigos.
              ¿Quién será el mejor pronosticador?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base px-8">
                  Registrarse <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-4 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center mb-12">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scoring Info */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="font-display text-3xl font-bold tracking-tight text-center mb-12">
            Sistema de puntuación
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Grupos', pts: '1-2 pts', color: 'bg-green-500' },
              { label: 'Dieciseisavos', pts: '3 pts', color: 'bg-blue-500' },
              { label: 'Octavos', pts: '5 pts', color: 'bg-indigo-500' },
              { label: 'Cuartos', pts: '8 pts', color: 'bg-purple-500' },
              { label: 'Semifinales', pts: '12 pts', color: 'bg-orange-500' },
              { label: 'Final', pts: '20 pts', color: 'bg-yellow-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className={`${item.color} text-white text-xl font-bold rounded-lg py-3 mb-3`}>
                      {item.pts}
                    </div>
                    <p className="text-sm font-medium">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        Porra Mundial 2026 &mdash; Hecho con pasión futbolera ⚽
      </footer>
    </div>
  );
}
