import { checkEditSpacePermission, checkSpaceIdAndSpaceInEntityAreSame } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';
import { emptyClickableDemo } from '@/components/clickableDemos/Edit/EmptyClickableDemo';
import { ByteCollectionItemType } from '../../../helpers/byteCollection/byteCollectionItemType';
import { ClickableDemoDto} from '@/types/clickableDemos/clickableDemo';
import { CreateClickableDemoRequest, DeleteClickableDemoRequest } from '@/types/request/ClickableDemoRequests';

async function getHandler(req: NextRequest, { params }: { params: { demoId: string; spaceId: string } }): Promise<NextResponse<ClickableDemoDto>>{
  const { demoId, spaceId } = params;
  const clickableDemoWithSteps = await prisma.clickableDemos.findUniqueOrThrow({
    where: {
      id: demoId,
    },
  });

  return NextResponse.json(clickableDemoWithSteps, { status: 200 });
}

async function deleteHandler(req: NextRequest, { params: { demoId,spaceId } }: { params: { demoId: string; spaceId: string } }) {
  const args: DeleteClickableDemoRequest = await req.json();
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
  return NextResponse.json({ status: 200, updatedClickableDemo });
}
async function postHandler(req: NextRequest, { params }: { params: { demoId: string; spaceId: string } }):Promise<NextResponse<ClickableDemoDto>> { 
  let clickableDemo;
  const { demoId, spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(params.spaceId);
  const args: CreateClickableDemoRequest = await req.json();
  const emptyClickableDemoModel = emptyClickableDemo();
  console.log('args', args);
  if (apiKey) {
    await validateApiKey(apiKey, params.spaceId);
    clickableDemo = await prisma.clickableDemos.upsert({
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
        steps: emptyClickableDemoModel.steps,
      },
      update: {
        title: args.input.title,
        excerpt: args.input.excerpt,
        updatedAt: new Date(),
        steps: emptyClickableDemoModel.steps,
      },
    });
  } else {
    checkSpaceIdAndSpaceInEntityAreSame(spaceId, spaceId);
    await checkEditSpacePermission(spaceById, req);
    clickableDemo = await prisma.clickableDemos.upsert({
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
        steps: args.input.steps,
      },
      update: {
        title: args.input.title,
        excerpt: args.input.excerpt,
        updatedAt: new Date(),
        steps: args.input.steps,
      },
    });
  }
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
  return NextResponse.json(clickableDemo , { status: 200 });
}

export const POST = withErrorHandlingV1(postHandler);
export const GET = withErrorHandlingV1(getHandler);
export const DELETE = withErrorHandlingV1(deleteHandler);