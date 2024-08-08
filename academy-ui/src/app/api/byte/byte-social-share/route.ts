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
  if (!args.byteId) return NextResponse.json({ body: 'No byteId provided' }, { status: 400 });
  if (!args.spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  const byteSocialShare = await prisma.byteSocialShare.findUnique({
    where: {
      byteId_spaceId: {
        byteId: args.byteId,
        spaceId: args.spaceId,
      },
    },
  });

  return NextResponse.json({ byteSocialShare }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
