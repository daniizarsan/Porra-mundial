import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getAppConfig, DEFAULT_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const config = await getAppConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const scoring = { ...DEFAULT_CONFIG.scoring, ...(body.scoring || {}) };
    const prizes = { ...DEFAULT_CONFIG.prizes, ...(body.prizes || {}) };

    // Validate split sums to ~100
    const splitSum = (prizes.split as number[]).reduce((a: number, b: number) => a + b, 0);
    if (Math.abs(splitSum - 100) > 1) {
      return NextResponse.json({ error: `Los porcentajes deben sumar 100% (actual: ${splitSum}%)` }, { status: 400 });
    }

    const data = JSON.stringify({ scoring, prizes });
    await prisma.appConfig.upsert({
      where: { id: 'singleton' },
      update: { data },
      create: { id: 'singleton', data },
    });
    return NextResponse.json({ scoring, prizes });
  } catch (e: any) {
    console.error('Config update error:', e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
