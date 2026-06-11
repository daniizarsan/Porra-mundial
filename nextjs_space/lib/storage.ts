import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function saveUploadedFile(fileName: string, buffer: Buffer): Promise<string> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const ext = path.extname(fileName);
  const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  await fs.writeFile(path.join(UPLOADS_DIR, name), buffer);
  return `/uploads/${name}`;
}

export async function deleteFile(storagePath: string): Promise<void> {
  if (!storagePath?.startsWith('/uploads/')) return;
  try {
    await fs.unlink(path.join(process.cwd(), 'public', storagePath));
  } catch { /* ignore */ }
}
