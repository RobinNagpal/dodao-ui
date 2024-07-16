import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const programs = await prisma.program.findMany({});
    return NextResponse.json({ status: 200, body: programs });
  } catch (error) {
    console.error('Error getting programs:', error);
    return NextResponse.json({ status: 500, body: 'Failed to get programs' });
  }
}
