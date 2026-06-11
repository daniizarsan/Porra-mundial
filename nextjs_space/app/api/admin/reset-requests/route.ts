export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN')
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    const requests = await prisma.passwordResetRequest.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true, alias: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN')
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    const { requestId, action, newPassword } = await req.json();
    if (!requestId || !action) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    const resetReq = await prisma.passwordResetRequest.findUnique({ where: { id: requestId } });
    if (!resetReq || resetReq.status !== 'PENDING')
      return NextResponse.json({ error: 'Solicitud no encontrada o ya procesada' }, { status: 400 });

    if (action === 'APPROVE') {
      if (!newPassword || newPassword.length < 6)
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.$transaction([
        prisma.user.update({ where: { id: resetReq.userId }, data: { password: hashed } }),
        prisma.passwordResetRequest.update({ where: { id: requestId }, data: { status: 'APPROVED', newPassword: '***' } }),
      ]);
    } else if (action === 'DENY') {
      await prisma.passwordResetRequest.update({ where: { id: requestId }, data: { status: 'DENIED' } });
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
