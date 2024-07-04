import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
const prisma = new PrismaClient();

export async function POST(req: NextRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, details, rating }: { name: string; details?: string; rating: number } = await req.json();

      if (!name) {
        return new Response('Missing required fields');
      }

      const newProgram = await prisma.program.create({
        data: {
          name,
          details,
          rating,
        },
      });

      return NextResponse.json({ status: '200', body: newProgram });
    } catch (error) {
      console.error('Error creating program:', error);
      return NextResponse.json({ status: '500', body: 'Failed to create a response' });
    }
  } else {
    return NextResponse.json({ status: '405', body: 'Method not allowed' });
  }
}
