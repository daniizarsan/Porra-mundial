export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const userId = req.nextUrl.searchParams.get('userId') || (session.user as any)?.id;
    const predictions = await prisma.groupPrediction.findMany({ where: { userId } });
    return NextResponse.json(predictions);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    // Check deadline
    const deadline = await prisma.deadline.findUnique({ where: { phase: 'GROUP_STAGE' } });
    if (deadline && new Date() > deadline.closesAt) {
      return NextResponse.json({ error: 'El plazo para predicciones de fase de grupos ha cerrado' }, { status: 403 });
    }
    const body = await req.json();
    const predictions = body?.predictions ?? [];
    const results = [];
    for (const pred of predictions) {
      const result = await prisma.groupPrediction.upsert({
        where: { userId_groupId: { userId, groupId: pred.groupId } },
        update: { positions: pred.positions, wins: pred.wins ?? null },
        create: { userId, groupId: pred.groupId, positions: pred.positions, wins: pred.wins ?? null },
      });
      results.push(result);
    }
    return NextResponse.json(results);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error saving predictions' }, { status: 500 });
  }
}
