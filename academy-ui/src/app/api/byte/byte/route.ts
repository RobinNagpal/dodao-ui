import { NextRequest, NextResponse } from 'next/server';
import { getByte } from '@/app/api/helpers/byte/getByte';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const byteId = searchParams.get('byteId');
  if (!byteId) return NextResponse.json({ body: 'No byteId provided' }, { status: 400 });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  return NextResponse.json({ byte: await getByte(spaceId, byteId) }, { status: 200 });
}
