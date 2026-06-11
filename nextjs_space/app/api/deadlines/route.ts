export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const deadlines = await prisma.deadline.findMany({ orderBy: { closesAt: 'asc' } });
    return NextResponse.json(deadlines);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error loading deadlines' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const body = await req.json();
    const { phase, closesAt } = body ?? {};
    if (!phase || !closesAt) {
      return NextResponse.json({ error: 'phase and closesAt required' }, { status: 400 });
    }
    const updated = await prisma.deadline.update({
      where: { phase },
      data: { closesAt: new Date(closesAt) },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error updating deadline' }, { status: 500 });
  }
}
