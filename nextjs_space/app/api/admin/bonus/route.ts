export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// PUT: admin sets the actual answer for a bonus question
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await req.json();
    const { questionId, answer, validOptions } = body;

    const data: any = {};
    if (answer !== undefined) data.answer = answer;
    if (validOptions !== undefined) data.validOptions = validOptions || null;

    const updated = await prisma.bonusQuestion.update({
      where: { id: questionId },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// POST: admin creates or updates a bonus question
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await req.json();
    const { slug, question, type, points, closesAt, validOptions } = body;

    const result = await prisma.bonusQuestion.upsert({
      where: { slug },
      update: { question, type, points: points ?? 5, closesAt: closesAt ? new Date(closesAt) : undefined, validOptions: validOptions ?? undefined },
      create: { slug, question, type, points: points ?? 5, closesAt: closesAt ? new Date(closesAt) : new Date('2026-06-11T21:00:00Z'), validOptions: validOptions ?? null },
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
