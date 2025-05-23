import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission, checkSpaceIdAndSpaceInEntityAreSame } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { MutationDeleteClickableDemoArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

async function getHandler(req: NextRequest, { params: { demoId } }: { params: { demoId: string } }) {
  const clickableDemoWithSteps = await prisma.clickableDemos.findUniqueOrThrow({
    where: {
      id: demoId,
    },
  });

  return NextResponse.json({ clickableDemoWithSteps }, { status: 200 });
}

async function deleteHandler(req: NextRequest, { params: { demoId } }: { params: { demoId: string } }) {
  const args: MutationDeleteClickableDemoArgs = await req.json();
  const spaceById = await getSpaceById(args.spaceId);
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

async function postHandler(req: NextRequest, { params }: { params: { demoId: string } }) {
  const { demoId } = params;
  try {
    const args = await req.json();
    const spaceById = await getSpaceById(args.spaceId);

    checkSpaceIdAndSpaceInEntityAreSame(args.spaceId, args.spaceId);
    await checkEditSpacePermission(spaceById, req);

    const clickableDemo = await prisma.clickableDemos.upsert({
      where: {
        id: demoId,
      },
      create: {
        id: args.input.id,
        title: args.input.title,
        excerpt: args.input.excerpt,
        spaceId: args.spaceId,
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
    return NextResponse.json({ clickableDemo }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withErrorHandling(getHandler);
export const DELETE = withErrorHandling(deleteHandler);
export const POST = withErrorHandling(postHandler);
