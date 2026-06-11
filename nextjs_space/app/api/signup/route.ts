export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, firstName, lastName, inviteCode } = body ?? {};
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Campos obligatorios: email, password, nombre' }, { status: 400 });
    }

    // Validar contraseña en servidor
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Validar código de invitación (obligatorio salvo en test mode interno)
    const isTestMode = process.env.__NEXT_TEST_MODE === '1';
    let invite: any = null;
    if (!isTestMode) {
      const codeStr = (inviteCode || '').toString().trim().toUpperCase();
      if (!codeStr) {
        return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
      }
      invite = await prisma.inviteCode.findUnique({ where: { code: codeStr } });
      if (!invite) {
        return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 400 });
      }
      if (invite.usedBy) {
        return NextResponse.json({ error: 'Este código ya ha sido usado' }, { status: 400 });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName: lastName ?? '' },
    });

    if (invite) {
      await prisma.inviteCode.update({
        where: { id: invite.id },
        data: { usedBy: email, usedAt: new Date() },
      });
    }

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (e: any) {
    console.error('Signup error:', e);
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}
