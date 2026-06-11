'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, HelpCircle, Trophy, Target, Hash, ToggleLeft, Save, CheckCircle2, Star } from 'lucide-react';
import { FlagImage } from '@/components/flag-image';

interface BonusQ {
  id: string;
  slug: string;
  question: string;
  type: string;
  points: number;
  answer: string | null;
  closesAt: string | null;
  prediction: string | null;
  validOptions: string | null;
}

interface TeamData { name: string; }

const TOP_10_FIFA = [
  'Argentina', 'France', 'Spain', 'England', 'Brazil',
  'Portugal', 'Netherlands', 'Belgium', 'Croatia', 'Germany',
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  player: <Target className="h-4 w-4 text-blue-500" />,
  team: <Trophy className="h-4 w-4 text-yellow-500" />,
  yesno: <ToggleLeft className="h-4 w-4 text-purple-500" />,
  number: <Hash className="h-4 w-4 text-green-500" />,
};

export function BonusPredictions() {
  const [questions, setQuestions] = useState<BonusQ[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [teams, setTeams] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/bonus').then(r => r.json()).then((data: any) => {
      if (Array.isArray(data)) {
        setQuestions(data);
        const ans: Record<string, string> = {};
        data.forEach((q: BonusQ) => { if (q.prediction) ans[q.id] = q.prediction; });
        setAnswers(ans);
        setSavedAnswers({ ...ans });
      }
    }).catch(() => {});
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      if (Array.isArray(data)) {
        const allTeams = data.flatMap((g: any) => g.teams?.map((t: TeamData) => t.name) ?? []);
        setTeams(allTeams.sort());
      }
    }).catch(() => {});
  }, []);

  const isLocked = (q: BonusQ) => q.closesAt ? new Date() > new Date(q.closesAt) : false;

  const hasChanges = () => {
    return questions.some(q => {
      if (isLocked(q)) return false;
      const current = answers[q.id]?.trim() ?? '';
      const saved = savedAnswers[q.id]?.trim() ?? '';
      return current !== saved && current !== '';
    });
  };

  const saveAll = async () => {
    const toSave = questions
      .filter(q => !isLocked(q) && answers[q.id]?.trim())
      .map(q => ({ questionId: q.id, answer: answers[q.id].trim().toUpperCase() }));

    if (toSave.length === 0) { toast.error('No hay respuestas que guardar'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictions: toSave }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.saved} respuesta(s) guardada(s)`);
        if (data.errors?.length) toast.warning(data.errors.join('. '));
        // Update saved state
        const newSaved = { ...savedAnswers };
        toSave.forEach(p => { newSaved[p.questionId] = p.answer; });
        setSavedAnswers(newSaved);
      } else {
        toast.error(data?.error ?? 'Error al guardar');
      }
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const getResult = (q: BonusQ) => {
    if (!q.answer || !q.prediction) return null;
    // Support multiple winning answers separated by # (all uppercase)
    const winningAnswers = q.answer.split('#').map(a => a.trim().toUpperCase());
    return winningAnswers.includes(q.prediction.toUpperCase().trim());
  };

  if (questions.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-8">No hay preguntas bonus disponibles todavía.</p>;
  }

  const openQuestions = questions.filter(q => !isLocked(q));

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Star className="h-4 w-4 text-yellow-500 inline mr-1" />
        Responde estas preguntas bonus para ganar puntos extra. Cada pregunta vale puntos diferentes según su dificultad.
      </div>

      <div className="grid gap-3">
        {questions.map((q) => {
          const locked = isLocked(q);
          const result = getResult(q);
          const savedPred = q.prediction;

          return (
            <Card key={q.id} className={`transition-all ${result === true ? 'ring-2 ring-green-500/40' : result === false ? 'ring-2 ring-red-500/30' : ''}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{TYPE_ICONS[q.type] ?? <HelpCircle className="h-4 w-4" />}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{q.question}</p>
                      <Badge variant="outline" className="shrink-0 font-mono">{q.points} pts</Badge>
                    </div>

                    {locked ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Lock className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-muted-foreground">Cerrada</span>
                        {savedPred && (
                          <span className="text-sm font-medium ml-2">
                            Tu respuesta: <span className="text-primary">{savedPred}</span>
                            {result === true && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />}
                            {result === false && <span className="text-red-500 ml-1">✗</span>}
                          </span>
                        )}
                        {q.answer && (
                          <span className="text-xs text-muted-foreground ml-auto">Respuesta real: <strong>{q.answer}</strong></span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {q.type === 'team' ? (
                          <select
                            value={answers[q.id] ?? ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
                          >
                            <option value="">Selecciona una selección...</option>
                            {(q.slug === 'surprise_team' ? teams.filter(t => !TOP_10_FIFA.includes(t)) : teams).map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : q.type === 'yesno' ? (
                          <div className="flex gap-2">
                            {['Sí', 'No'].map((opt) => (
                              <Button
                                key={opt}
                                variant={answers[q.id] === opt ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              >
                                {opt}
                              </Button>
                            ))}
                          </div>
                        ) : q.type === 'number' ? (
                          <Input
                            type="number"
                            min={0}
                            value={answers[q.id] ?? ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Número..."
                            className="w-28"
                          />
                        ) : (
                          <Input
                            value={answers[q.id] ?? ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value.toUpperCase() }))}
                            placeholder="Escribe tu respuesta..."
                            className="flex-1 uppercase"
                          />
                        )}
                        {savedAnswers[q.id] && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                    )}

                    {!locked && savedAnswers[q.id] && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Guardado: <span className="font-medium text-foreground">{savedAnswers[q.id]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Botón guardar general */}
      {openQuestions.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <Button
            onClick={saveAll}
            disabled={saving || !hasChanges()}
            className="w-full gap-2 shadow-lg"
            size="lg"
          >
            {saving ? 'Guardando...' : <><Save className="h-4 w-4" /> Guardar todas las respuestas</>}
          </Button>
        </div>
      )}
    </div>
  );
}
