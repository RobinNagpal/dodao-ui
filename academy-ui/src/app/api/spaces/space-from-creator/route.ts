import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

function postHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const creatorUsername = searchParams.get('creatorUsername');
  if (!creatorUsername) return NextResponse.json({ body: 'No creatorUsername provided' }, { status: 400 });
  const space = prisma.space.findFirst({
    where: {
      creator: creatorUsername!,
    },
  });
  return NextResponse.json({ body: space }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
