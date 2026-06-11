'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, ChevronDown, ChevronUp, Target, Crosshair, Star, Trophy, Medal, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Config {
  scoring: Record<string, number>;
  prizes: { entryFee: number; split: number[]; lastGetsRefund: boolean };
}

export function ScoringInfo({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [cfg, setCfg] = useState<Config | null>(null);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setCfg).catch(() => {});
  }, []);

  const s = cfg?.scoring;
  const p = cfg?.prizes;

  return (
    <Card className="border-primary/20">
      <button onClick={() => setOpen(!open)} className="w-full">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              ¿Cómo se puntúa?
            </span>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
      </button>

      <AnimatePresence>
        {open && cfg && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-4 space-y-4">
              {/* Fase de Grupos */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Target className="h-3.5 w-3.5 text-blue-500" /> Fase de Grupos
                </h4>
                <div className="space-y-1.5 text-sm">
                  <Row label="Posición exacta acertada" pts={s!.GROUP_POSITION} color="blue" />
                  <Row label="Equipo clasificado (top 2) acertado" pts={s!.GROUP_QUALIFIER} color="blue" />
                  <Row label="Nº de victorias exacto por equipo" pts={s!.GROUP_WINS} color="blue" />
                  <p className="text-xs text-muted-foreground pl-3">
                    💡 Se suman todos: posición + clasificado + victorias.
                  </p>
                </div>
              </div>

              {/* Eliminatorias */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Crosshair className="h-3.5 w-3.5 text-green-500" /> Eliminatorias
                </h4>
                <div className="space-y-1.5 text-sm">
                  <Row label="Dieciseisavos (1/16)" pts={s!.ROUND_OF_32} color="green" />
                  <Row label="Octavos de final" pts={s!.ROUND_OF_16} color="green" />
                  <Row label="Cuartos de final" pts={s!.QUARTER_FINALS} color="green" />
                  <Row label="Semifinales" pts={s!.SEMI_FINALS} color="green" />
                  <Row label="Final" pts={s!.FINAL} color="green" />
                  <Row label="3er puesto" pts={s!.THIRD_PLACE} color="green" />
                  <Row label="Gol exacto por equipo (marcador)" pts={s!.SCORE_GOAL} color="green" />
                  <p className="text-xs text-muted-foreground pl-3">
                    💡 Además del ganador, puedes predecir el marcador. Por cada gol acertado de cada equipo, +{s!.SCORE_GOAL} pt.
                  </p>
                </div>
              </div>

              {/* Premios */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Trophy className="h-3.5 w-3.5 text-primary" /> Premios
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between bg-primary/5 rounded-md px-3 py-1.5">
                    <span className="flex items-center gap-1.5"><Medal className="h-3.5 w-3.5 text-yellow-500" /> 1º puesto</span>
                    <span className="font-mono font-bold text-primary">{p!.split[0]}% del bote</span>
                  </div>
                  <div className="flex items-center justify-between bg-primary/5 rounded-md px-3 py-1.5">
                    <span className="flex items-center gap-1.5"><Medal className="h-3.5 w-3.5 text-gray-400" /> 2º puesto</span>
                    <span className="font-mono font-bold text-primary">{p!.split[1]}% del bote</span>
                  </div>
                  <div className="flex items-center justify-between bg-primary/5 rounded-md px-3 py-1.5">
                    <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-amber-600" /> 3º puesto</span>
                    <span className="font-mono font-bold text-primary">{p!.split[2]}% del bote</span>
                  </div>
                  {p!.lastGetsRefund && (
                    <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5">
                      <span>💩 Último puesto</span>
                      <span className="font-mono font-bold text-muted-foreground">Recupera su cuota ({p!.entryFee}€)</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground pl-3">
                    Cuota: <strong>{p!.entryFee}€</strong> por persona. En caso de empate se fusionan los premios y se reparten a partes iguales.
                  </p>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/5', text: 'text-blue-500' },
  green: { bg: 'bg-green-500/5', text: 'text-green-500' },
};

function Row({ label, pts, color }: { label: string; pts: number; color: string }) {
  const c = COLOR_CLASSES[color] ?? COLOR_CLASSES.blue;
  return (
    <div className={`flex items-center justify-between ${c.bg} rounded-md px-3 py-1.5`}>
      <span>{label}</span>
      <span className={`font-mono font-bold ${c.text}`}>+{pts} {pts === 1 ? 'pt' : 'pts'}</span>
    </div>
  );
}
