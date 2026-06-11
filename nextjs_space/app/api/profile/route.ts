export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, alias: true, avatarUrl: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const userId = (session.user as any)?.id;
    const { alias, avatarUrl } = await req.json();
    const data: any = {};
    if (alias !== undefined) data.alias = alias.trim() || null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;
    await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
