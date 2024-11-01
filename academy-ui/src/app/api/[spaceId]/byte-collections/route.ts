import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { ByteCollectionDto } from '@/types/byteCollections/byteCollection';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';
import { createNewEntityId } from '@dodao/web-core/utils/space/createNewEntityId';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ByteCollectionDto>> {
  const args: CreateByteCollectionRequest = await req.json();
  const { spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');
  if (apiKey) {
    await validateApiKey(apiKey, spaceId);
  } else {
    const spaceById = await getSpaceById(spaceId);
    await checkEditSpacePermission(spaceById, req);
  }
  const byteCollection = await prisma.byteCollection.create({
    data: {
      id: createNewEntityId(`${args.name} tbc`, spaceId), // tbc = tidbit collection
      name: args.name,
      description: args.description,
      spaceId: spaceId,
      byteIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      archive: false,
      priority: 50,
      videoUrl: '',
    },
  });

  return NextResponse.json(byteCollection as ByteCollectionDto, { status: 200 });
}

export const POST = withErrorHandlingV1<ByteCollectionDto>(postHandler);
