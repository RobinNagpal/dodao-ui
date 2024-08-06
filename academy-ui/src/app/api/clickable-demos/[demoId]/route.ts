import { checkEditSpacePermission, checkSpaceIdAndSpaceInEntityAreSame } from '@/app/api/helpers/space/checkEditSpacePermission';
import { MutationDeleteClickableDemoArgs, ByteCollectionFragment, MutationUpsertClickableDemoArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { NextRequest, NextResponse } from 'next/server';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest, { params: { demoId } }: { params: { demoId: string } }) {
  const clickableDemoWithSteps = await prisma.clickableDemos.findUniqueOrThrow({
    where: {
      id: demoId,
    },
  });

  return NextResponse.json({ status: 200, clickableDemoWithSteps });
}

export async function DELETE(req: NextRequest, { params: { demoId } }: { params: { demoId: string } }) {
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
  return NextResponse.json({ status: 200, updatedClickableDemo });
}

export async function PUT(req: NextRequest, { params }: { params: { demoId: string } }) {
  const { demoId } = params;
  try {
    const args = await req.json();
    const byteCollection: ByteCollectionFragment = args.byteCollection;
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
        byteCollectionId: byteCollection.id,
        itemType: ByteCollectionItemType.ClickableDemo,
      },
    });

    if (!existingMapping) {
      const mappingItem = await prisma.byteCollectionItemMappings.create({
        data: {
          id: uuidv4(),
          itemType: ByteCollectionItemType.ClickableDemo,
          order: byteCollection.demos.length + 1,
          itemId: clickableDemo.id,
          ByteCollection: {
            connect: { id: byteCollection.id },
          },
        },
      });
    }

    return NextResponse.json({ status: 200, clickableDemo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
  }
}
