export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const matchups = await prisma.bracketMatchup.findMany({ orderBy: [{ round: 'asc' }, { matchIndex: 'asc' }] });
    return NextResponse.json(matchups);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await req.json();
    const { round, matchIndex, teamA, teamB } = body;
    if (!round || matchIndex == null || !teamA || !teamB) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    const result = await prisma.bracketMatchup.upsert({
      where: { round_matchIndex: { round, matchIndex } },
      update: { teamA, teamB },
      create: { round, matchIndex, teamA, teamB },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
