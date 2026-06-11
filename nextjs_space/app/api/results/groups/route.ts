export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const results = await prisma.actualGroupResult.findMany();
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
    const { groupId, positions, wins } = body ?? {};
    if (!groupId || !positions) {
      return NextResponse.json({ error: 'groupId and positions required' }, { status: 400 });
    }
    const result = await prisma.actualGroupResult.upsert({
      where: { groupId },
      update: { positions, wins: wins ?? null },
      create: { groupId, positions, wins: wins ?? null },
    });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
