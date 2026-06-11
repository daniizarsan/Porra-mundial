export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { saveUploadedFile } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Falta el fichero' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Máximo 5MB' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Solo imágenes' }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUploadedFile(file.name, buffer);
    return NextResponse.json({ url });
  } catch (e: any) {
    console.error('upload error:', e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
