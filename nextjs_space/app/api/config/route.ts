import { NextResponse } from 'next/server';
import { getAppConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Public endpoint — anyone authenticated can read scoring/prize config
export async function GET() {
  const config = await getAppConfig();
  return NextResponse.json(config);
}
