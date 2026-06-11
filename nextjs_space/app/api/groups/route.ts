export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      include: { teams: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(groups);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error loading groups' }, { status: 500 });
  }
}
