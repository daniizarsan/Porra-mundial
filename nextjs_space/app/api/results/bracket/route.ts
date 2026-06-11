export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const results = await prisma.actualBracketResult.findMany();
    return NextResponse.json(results);
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
    const { round, matchIndex, teamName, scoreA, scoreB } = body ?? {};
    if (!round || matchIndex === undefined || !teamName) {
      return NextResponse.json({ error: 'round, matchIndex and teamName required' }, { status: 400 });
    }
    const result = await prisma.actualBracketResult.upsert({
      where: { round_matchIndex: { round, matchIndex } },
      update: { teamName, scoreA: scoreA ?? null, scoreB: scoreB ?? null },
      create: { round, matchIndex, teamName, scoreA: scoreA ?? null, scoreB: scoreB ?? null },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
