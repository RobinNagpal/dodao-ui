import { QueryByteSocialShareArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const args: QueryByteSocialShareArgs = {
    byteId: searchParams.get('byteId')!,
    spaceId: searchParams.get('spaceId')!,
  };
  if (!args.byteId) return NextResponse.json({ status: 400, body: 'No byteId provided' });
  if (!args.spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

  const byteSocialShare = await prisma.byteSocialShare.findUnique({
    where: {
      byteId_spaceId: {
        byteId: args.byteId,
        spaceId: args.spaceId,
      },
    },
  });

  return NextResponse.json({ status: 200, byteSocialShare });
}

export const GET = withErrorHandling(getHandler);
