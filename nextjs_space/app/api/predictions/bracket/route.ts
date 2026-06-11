export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// All knockout rounds share a single deadline phase
const KNOCKOUT_PHASE = 'ROUND_OF_32';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const userId = req.nextUrl.searchParams.get('userId') || (session.user as any)?.id;
    const predictions = await prisma.bracketPrediction.findMany({ where: { userId } });
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
    const body = await req.json();
    const predictions = body?.predictions ?? [];
    const results = [];
    for (const pred of predictions) {
      const deadline = await prisma.deadline.findUnique({ where: { phase: KNOCKOUT_PHASE } });
      if (deadline && new Date() > deadline.closesAt) {
        continue; // all knockout rounds closed at once
      }
      const result = await prisma.bracketPrediction.upsert({
        where: { userId_round_matchIndex: { userId, round: pred.round, matchIndex: pred.matchIndex } },
        update: { teamName: pred.teamName, scoreA: pred.scoreA ?? null, scoreB: pred.scoreB ?? null },
        create: { userId, round: pred.round, matchIndex: pred.matchIndex, teamName: pred.teamName, scoreA: pred.scoreA ?? null, scoreB: pred.scoreB ?? null },
      });
      results.push(result);
    }
    return NextResponse.json(results);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error saving predictions' }, { status: 500 });
  }
}

// DELETE: remove cascaded predictions when user changes an earlier pick
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const body = await req.json();
    const predsToDelete = body?.predictions ?? [];
    for (const pred of predsToDelete) {
      await prisma.bracketPrediction.deleteMany({
        where: { userId, round: pred.round, matchIndex: pred.matchIndex },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error deleting predictions' }, { status: 500 });
  }
}
