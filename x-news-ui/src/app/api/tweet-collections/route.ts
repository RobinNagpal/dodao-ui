import { withErrorHandlingV1 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { TweetCollectionSummary } from '@/types/tweetCollections/tweetCollection';
import { NextRequest, NextResponse } from 'next/server';
import { randomString } from '@dodao/web-core/api/auth/custom-email/send-verification';
import { validateAdminKey } from '@/utils/auth/validateAdminKey';

async function getHandler(req: NextRequest): Promise<NextResponse<TweetCollectionSummary[]>> {
  const tweetCollections = await prisma.tweetCollection.findMany({
    include: {
      tweets: true,
    },
  });

  return NextResponse.json(tweetCollections, { status: 200 });
}

async function postHandler(req: NextRequest): Promise<NextResponse> {
  const validationError = validateAdminKey(req);
  if (validationError) return validationError;

  try {
    const body = await req.json();

    const { name, description, handles, archive } = body;

    const id = randomString(10);
    const newCollection = await prisma.tweetCollection.create({
      data: {
        id,
        name,
        description,
        handles,
        archive,
      },
    });

    return NextResponse.json({ newCollection }, { status: 201 });
  } catch (error) {
    console.error('Error creating tweet collection:', error);
    return NextResponse.json({ error: 'Failed to create tweet collection.' }, { status: 500 });
  }
}

export const GET = withErrorHandlingV1<TweetCollectionSummary[]>(getHandler);
export const POST = withErrorHandlingV1(postHandler);
