import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { ByteDto } from '@/types/bytes/ByteDto';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<{ bytes: ByteDto[] }>> {
  const bytes = (await prisma.byte.findMany({ where: { spaceId: params.spaceId } })) as ByteDto[];
  return NextResponse.json({ bytes }, { status: 200 });
}

export const GET = withErrorHandlingV1<{ bytes: ByteDto[] }>(getHandler);