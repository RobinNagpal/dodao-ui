import { NextRequest, NextResponse } from 'next/server';
import { getByte } from '@/app/api/helpers/byte/getByte';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const byteId = searchParams.get('byteId');
  if (!byteId) return NextResponse.json({ status: 400, body: 'No byteId provided' });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

  return NextResponse.json({ status: 200, byte: await getByte(spaceId, byteId) });
}
