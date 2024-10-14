import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { ClickableDemoStepInput } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { ClickableDemoDto } from '@/types/clickableDemos/ClickableDemoDto';
import { CreateClickableDemoRequest } from '@/types/request/ClickableDemoRequests';
import { sampleClickableDemo } from '@/utils/clickableDemos/EmptyClickableDemo';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ByteCollectionItemType } from '../../../helpers/byteCollection/byteCollectionItemType';
import { revalidateTag } from 'next/cache';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';

async function getHandler(req: NextRequest, { params }: { params: { demoId: string; spaceId: string } }): Promise<NextResponse<ClickableDemoDto>> {
  const { demoId } = params;
  const clickableDemoWithSteps = await prisma.clickableDemos.findUniqueOrThrow({
    where: {
      id: demoId,
    },
  });

  return NextResponse.json(clickableDemoWithSteps as ClickableDemoDto, { status: 200 });
}

async function deleteHandler(
  req: NextRequest,
  { params: { demoId, spaceId } }: { params: { demoId: string; spaceId: string } }
): Promise<NextResponse<ClickableDemoDto>> {
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);
  const updatedClickableDemo = await prisma.clickableDemos.update({
    where: {
      id: demoId,
    },
    data: {
      archive: true,
    },
  });

  await prisma.byteCollectionItemMappings.updateMany({
    where: {
      itemId: demoId,
    },
    data: {
      archive: true,
    },
  });
  revalidateTag(TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString());
  return NextResponse.json(updatedClickableDemo as ClickableDemoDto, { status: 200 });
}
async function postHandler(req: NextRequest, { params }: { params: { demoId: string; spaceId: string } }): Promise<NextResponse<ClickableDemoDto>> {
  const { demoId, spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(params.spaceId);
  const args: CreateClickableDemoRequest = await req.json();

  const clickableDemoSteps = args.input.steps?.length > 0 ? args.input.steps : [sampleClickableDemo() as ClickableDemoStepInput];

  if (apiKey) {
    await validateApiKey(apiKey, params.spaceId);
  } else {
    await checkEditSpacePermission(spaceById, req);
  }
  const clickableDemo = await prisma.clickableDemos.upsert({
    where: {
      id: demoId,
    },
    create: {
      id: demoId,
      title: args.input.title,
      excerpt: args.input.excerpt,
      spaceId: spaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: clickableDemoSteps,
    },
    update: {
      title: args.input.title,
      excerpt: args.input.excerpt,
      updatedAt: new Date(),
      steps: clickableDemoSteps,
    },
  });

  const existingMapping = await prisma.byteCollectionItemMappings.findFirst({
    where: {
      itemId: clickableDemo.id,
      byteCollectionId: args.byteCollectionId,
      itemType: ByteCollectionItemType.ClickableDemo,
    },
  });

  if (!existingMapping) {
    const byteCollection = await prisma.byteCollection.findUnique({
      where: {
        id: args.byteCollectionId,
      },
      select: {
        items: true,
      },
    });
    const items = byteCollection?.items;
    let highestOrderNumber = 0;
    if (items && items?.length > 0) {
      const orderNumbers = items.map((item) => item.order);
      highestOrderNumber = orderNumbers.length > 0 ? Math.max(...orderNumbers) : 0;
    }
    await prisma.byteCollectionItemMappings.create({
      data: {
        id: uuidv4(),
        itemType: ByteCollectionItemType.ClickableDemo,
        order: highestOrderNumber + 1,
        itemId: clickableDemo.id,
        ByteCollection: {
          connect: { id: args.byteCollectionId },
        },
      },
    });
  }
  revalidateTag(TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString());
  return NextResponse.json(clickableDemo as ClickableDemoDto, { status: 200 });
}

export const POST = withErrorHandlingV1<ClickableDemoDto>(postHandler);
export const GET = withErrorHandlingV1<ClickableDemoDto>(getHandler);
export const DELETE = withErrorHandlingV1<ClickableDemoDto>(deleteHandler);
