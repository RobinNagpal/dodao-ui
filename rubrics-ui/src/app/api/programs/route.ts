import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const programs = await prisma.program.findMany({});
    return NextResponse.json({ status: 200, body: programs });
  } catch (error) {
    console.log('Error getting programs:', error);
    return NextResponse.json({ status: 500, body: 'Failed to get programs' });
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { id, name, details, summary, rubricIds }: { id?: string; name: string; details: string; summary: string; rubricIds?: string[] } = await req.json();

    let programData: any = {
      name,
      details,
      summary,
    };

    let createdProgram;

    if (rubricIds && rubricIds.length > 0) {
      const rubrics = await prisma.rubric.findMany({
        where: {
          id: {
            in: rubricIds,
          },
        },
      });

      createdProgram = await prisma.program.create({
        data: {
          ...programData,
          rubrics: {
            create: rubrics.map((rubric) => ({
              rubric: { connect: { id: rubric.id } },
            })),
          },
        },
        include: {
          rubrics: true,
        },
      });
    } else {
      createdProgram = await prisma.program.create({
        data: programData,
      });
    }

    return NextResponse.json({ status: 200, body: createdProgram });
  } catch (error) {
    console.log('Error creating program:', error);
    return NextResponse.json({ status: 500, body: 'Failed to create program' });
  }
}
