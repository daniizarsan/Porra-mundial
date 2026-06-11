'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, CheckCircle2, Star, Plus } from 'lucide-react';

interface BonusQ {
  id: string;
  slug: string;
  question: string;
  type: string;
  points: number;
  answer: string | null;
  validOptions: string | null;
  closesAt: string | null;
  prediction: string | null;
}

const TOP_10_FIFA = [
  'Argentina', 'France', 'Spain', 'England', 'Brazil',
  'Portugal', 'Netherlands', 'Belgium', 'Croatia', 'Germany',
];

export function AdminBonus() {
  const [questions, setQuestions] = useState<BonusQ[]>([]);
  const [realAnswers, setRealAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [teams, setTeams] = useState<string[]>([]);

  // New question form
  const [newSlug, setNewSlug] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newType, setNewType] = useState('player');
  const [newPoints, setNewPoints] = useState(5);

  useEffect(() => {
    fetch('/api/bonus').then(r => r.json()).then((data: any) => {
      if (Array.isArray(data)) {
        setQuestions(data);
        const ans: Record<string, string> = {};
        data.forEach((q: BonusQ) => {
          if (q.answer) ans[q.id] = q.answer;
        });
        setRealAnswers(ans);
      }
    }).catch(() => {});
    fetch('/api/groups').then(r => r.json()).then((data: any) => {
      if (Array.isArray(data)) {
        const allTeams = data.flatMap((g: any) => g.teams?.map((t: any) => t.name) ?? []);
        setTeams(allTeams.sort());
      }
    }).catch(() => {});
  }, []);

  const saveRealAnswer = async (questionId: string) => {
    const answer = realAnswers[questionId];
    if (!answer?.trim()) { toast.error('Escribe la respuesta real'); return; }
    setSaving(questionId);
    try {
      const res = await fetch('/api/admin/bonus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer: answer.trim().toUpperCase(),
        }),
      });
      if (res.ok) {
        toast.success('Respuesta guardada');
        setRealAnswers(prev => ({ ...prev, [questionId]: answer.trim().toUpperCase() }));
      } else toast.error('Error al guardar');
    } catch { toast.error('Error'); }
    finally { setSaving(null); }
  };

  const addQuestion = async () => {
    if (!newSlug.trim() || !newQuestion.trim()) { toast.error('Rellena slug y pregunta'); return; }
    try {
      const res = await fetch('/api/admin/bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newSlug.trim(),
          question: newQuestion.trim(),
          type: newType,
          points: newPoints,
        }),
      });
      if (res.ok) {
        toast.success('Pregunta añadida');
        setNewSlug(''); setNewQuestion(''); setNewType('player'); setNewPoints(5);
        const data = await fetch('/api/bonus').then(r => r.json());
        if (Array.isArray(data)) setQuestions(data);
      } else toast.error('Error al crear');
    } catch { toast.error('Error'); }
  };

  const isTextType = (type: string) => type === 'player' || type === 'text';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-yellow-500" /> Preguntas Bonus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Establece las respuestas reales. Para preguntas de texto libre, puedes poner varias respuestas ganadoras separadas por <code className="bg-muted px-1 rounded">#</code> (ej: <code className="bg-muted px-1 rounded">MESSI#LEO MESSI</code>). Todo se guarda en MAYÚSCULAS.</p>

          {questions.map((q) => (
            <div key={q.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{q.type}</Badge>
                    <Badge variant="outline" className="text-xs font-mono">{q.points} pts</Badge>
                    <span className="text-xs text-muted-foreground">slug: {q.slug}</span>
                  </div>
                </div>
              </div>

              {/* Respuesta real (con # para múltiples ganadoras en texto libre) */}
              <div className="flex items-center gap-2">
                {q.type === 'team' ? (
                  <select
                    value={realAnswers[q.id] ?? ''}
                    onChange={(e) => setRealAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Selecciona una selección...</option>
                    {(q.slug === 'surprise_team' ? teams.filter(t => !TOP_10_FIFA.includes(t)) : teams).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : q.type === 'yesno' ? (
                  <select
                    value={realAnswers[q.id] ?? ''}
                    onChange={(e) => setRealAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Selecciona...</option>
                    <option value="SÍ">Sí</option>
                    <option value="NO">No</option>
                  </select>
                ) : (
                  <Input
                    type={q.type === 'number' ? 'number' : 'text'}
                    value={realAnswers[q.id] ?? ''}
                    onChange={(e) => setRealAnswers(prev => ({ ...prev, [q.id]: e.target.value.toUpperCase() }))}
                    placeholder={isTextType(q.type) ? 'RESPUESTA#ALTERNATIVA (separar con #)' : 'Respuesta real...'}
                    className="flex-1 uppercase"
                  />
                )}
                <Button size="sm" onClick={() => saveRealAnswer(q.id)} disabled={saving === q.id}>
                  {q.answer ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
              {q.answer && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs text-green-500">Ganadoras:</span>
                  {q.answer.split('#').filter(Boolean).map((a, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-mono">{a.trim()}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add new question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" /> Añadir Pregunta Bonus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Slug (único, ej: mvp_player)" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
              <option value="player">Jugador</option>
              <option value="team">Selección</option>
              <option value="yesno">Sí/No</option>
              <option value="number">Número</option>
            </select>
            <Input placeholder="Pregunta" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} className="col-span-2" />
            <Input type="number" placeholder="Puntos" value={newPoints} onChange={(e) => setNewPoints(Number(e.target.value))} />
            <Button onClick={addQuestion}><Plus className="h-4 w-4 mr-1" /> Añadir</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
