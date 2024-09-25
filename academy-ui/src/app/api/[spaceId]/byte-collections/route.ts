import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';
import { CreateByteCollectionWithApiRequest } from '@/types/request/ByteCollectionRequests';
import { ByteCollectionDto } from '@/types/byteCollections/byteCollection';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';

async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ByteCollectionDto>> {
  const args: CreateByteCollectionWithApiRequest = await req.json();
  console.log(args);
  const { spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');
  if (apiKey) {
    await validateApiKey(apiKey, spaceId!);
  }
  const byteCollection = await prisma.byteCollection.create({
    data: {
      id: v4(),
      name: args.input.name,
      description: args.input.description,
      spaceId: spaceId,
      byteIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'DRAFT',
      priority: 50,
      videoUrl: '',
    },
  });

  return NextResponse.json(byteCollection, { status: 200 });
}

export const POST = withErrorHandlingV1(postHandler);
