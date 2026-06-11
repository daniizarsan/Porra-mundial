'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Target, Crosshair, Trophy, Save } from 'lucide-react';

interface Config {
  scoring: Record<string, number>;
  prizes: {
    entryFee: number;
    split: number[];
    lastGetsRefund: boolean;
  };
}

const SCORING_LABELS: Record<string, string> = {
  GROUP_POSITION: 'Posición exacta (grupos)',
  GROUP_QUALIFIER: 'Clasificado top 2 (grupos)',
  GROUP_WINS: 'Victorias exactas por equipo (grupos)',
  ROUND_OF_32: 'Dieciseisavos (1/16)',
  ROUND_OF_16: 'Octavos de final',
  QUARTER_FINALS: 'Cuartos de final',
  SEMI_FINALS: 'Semifinales',
  FINAL: 'Final',
  THIRD_PLACE: '3er puesto',
  SCORE_GOAL: 'Gol exacto por equipo (eliminatorias)',
};

const SCORING_ORDER = [
  'GROUP_POSITION', 'GROUP_QUALIFIER', 'GROUP_WINS',
  'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'THIRD_PLACE', 'SCORE_GOAL',
];

export function AdminConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/config').then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  const updateScoring = (key: string, value: number) => {
    if (!config) return;
    setConfig({ ...config, scoring: { ...config.scoring, [key]: value } });
  };

  const updateSplit = (index: number, value: number) => {
    if (!config) return;
    const newSplit = [...config.prizes.split];
    newSplit[index] = value;
    setConfig({ ...config, prizes: { ...config.prizes, split: newSplit } });
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (r.ok) {
        toast.success('Configuración guardada');
        const updated = await r.json();
        setConfig(updated);
      } else {
        const d = await r.json();
        toast.error(d?.error ?? 'Error al guardar');
      }
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <p className="text-sm text-muted-foreground">Cargando configuración…</p>;

  const splitSum = config.prizes.split.reduce((a, b) => a + b, 0);
  const splitValid = Math.abs(splitSum - 100) <= 1;

  return (
    <div className="space-y-6">
      {/* Puntos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-blue-500" /> Puntos — Fase de Grupos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['GROUP_POSITION', 'GROUP_QUALIFIER', 'GROUP_WINS'].map(key => (
              <div key={key} className="space-y-1">
                <Label className="text-sm">{SCORING_LABELS[key]}</Label>
                <Input
                  type="number" min={0} max={100}
                  value={config.scoring[key] ?? 0}
                  onChange={(e) => updateScoring(key, parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crosshair className="h-4 w-4 text-green-500" /> Puntos — Eliminatorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'THIRD_PLACE', 'SCORE_GOAL'].map(key => (
              <div key={key} className="space-y-1">
                <Label className="text-sm">{SCORING_LABELS[key]}</Label>
                <Input
                  type="number" min={0} max={100}
                  value={config.scoring[key] ?? 0}
                  onChange={(e) => updateScoring(key, parseInt(e.target.value) || 0)}
                  className="font-mono"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" /> Premios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <Label>Cuota de entrada (€)</Label>
            <Input
              type="number" min={0} max={1000}
              value={config.prizes.entryFee}
              onChange={(e) => setConfig({ ...config, prizes: { ...config.prizes, entryFee: parseInt(e.target.value) || 0 } })}
              className="font-mono max-w-[160px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Reparto del bote (%)</Label>
            <div className="grid grid-cols-3 gap-3">
              {['1º puesto', '2º puesto', '3º puesto'].map((label, i) => (
                <div key={i} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    type="number" min={0} max={100}
                    value={config.prizes.split[i] ?? 0}
                    onChange={(e) => updateSplit(i, parseInt(e.target.value) || 0)}
                    className="font-mono"
                  />
                </div>
              ))}
            </div>
            <p className={`text-xs ${splitValid ? 'text-muted-foreground' : 'text-destructive font-semibold'}`}>
              Total: {splitSum}%{!splitValid && ' — ¡Debe sumar 100%!'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={config.prizes.lastGetsRefund}
              onCheckedChange={(v) => setConfig({ ...config, prizes: { ...config.prizes, lastGetsRefund: v } })}
            />
            <Label>Último puesto recupera su cuota</Label>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving || !splitValid} className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Guardando…' : 'Guardar configuración'}
      </Button>
    </div>
  );
}
