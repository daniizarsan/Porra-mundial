export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generatePresignedUploadUrl } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { fileName, contentType, isPublic } = await req.json();
    if (!fileName || !contentType) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    const result = await generatePresignedUploadUrl(fileName, contentType, !!isPublic);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('presigned upload error:', e);
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
