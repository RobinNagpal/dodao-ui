import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { programId: string } }) {
  const url = new URL(req.url);
  const programId = url.searchParams.get('programId');

  if (!programId) {
    return NextResponse.json({ status: 400, body: 'Missing rubricId' });
  }
  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ status: 404, body: 'Program not found' });
    }

    return NextResponse.json({ status: 200, body: program });
  } catch (error) {
    console.log('Error getting program:', error);
    return NextResponse.json({ status: 500, body: 'Failed to get program' });
  }
}
