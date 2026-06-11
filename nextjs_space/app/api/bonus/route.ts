export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET: return all bonus questions + user's predictions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const userId = req.nextUrl.searchParams.get('userId') || (session.user as any)?.id;

    const questions = await prisma.bonusQuestion.findMany({ orderBy: { createdAt: 'asc' } });
    const predictions = await prisma.bonusPrediction.findMany({ where: { userId } });

    const predMap = new Map(predictions.map((p: any) => [p.questionId, p.answer]));

    const result = questions.map((q: any) => ({
      id: q.id,
      slug: q.slug,
      question: q.question,
      type: q.type,
      points: q.points,
      answer: q.answer,
      closesAt: q.closesAt?.toISOString() ?? null,
      prediction: predMap.get(q.id) ?? null,
      validOptions: q.validOptions ?? null,
    }));

    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// POST: save ALL bonus predictions at once (bulk)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const body = await req.json();

    // Support both single {questionId, answer} and bulk {predictions: [{questionId, answer}]}
    const predictions: { questionId: string; answer: string }[] = body.predictions
      ? body.predictions
      : body.questionId ? [{ questionId: body.questionId, answer: body.answer }] : [];

    if (predictions.length === 0) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });

    const questions = await prisma.bonusQuestion.findMany();
    const qMap = new Map(questions.map((q: any) => [q.id, q]));

    const results = [];
    const errors = [];

    for (const pred of predictions) {
      if (!pred.questionId || !pred.answer?.trim()) continue;

      const question = qMap.get(pred.questionId);
      if (!question) { errors.push(`Pregunta ${pred.questionId} no encontrada`); continue; }
      if (question.closesAt && new Date() > question.closesAt) {
        errors.push(`"${question.question}" ya está cerrada`);
        continue;
      }

      const result = await prisma.bonusPrediction.upsert({
        where: { userId_questionId: { userId, questionId: pred.questionId } },
        update: { answer: pred.answer.trim() },
        create: { userId, questionId: pred.questionId, answer: pred.answer.trim() },
      });
      results.push(result);
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json({ error: errors.join('. ') }, { status: 403 });
    }

    return NextResponse.json({ saved: results.length, errors });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
