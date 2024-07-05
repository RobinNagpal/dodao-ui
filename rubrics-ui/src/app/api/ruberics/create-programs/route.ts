import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { name, details }: { name: string; details?: string } = await req.json();

    const newProgram = await prisma.program.create({
      data: {
        name,
        details,
      },
    });

    return NextResponse.json({ status: 200, body: newProgram });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ status: 500, body: 'Failed to create a program' });
  }
}
