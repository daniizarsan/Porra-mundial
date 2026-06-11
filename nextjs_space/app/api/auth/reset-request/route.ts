export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();
    if (!email?.trim()) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    // Always return success to not leak if email exists
    if (!user) return NextResponse.json({ success: true });
    // Check for existing pending request
    const existing = await prisma.passwordResetRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    });
    if (existing) return NextResponse.json({ success: true });
    await prisma.passwordResetRequest.create({
      data: { userId: user.id, message: message?.trim() || '' },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
