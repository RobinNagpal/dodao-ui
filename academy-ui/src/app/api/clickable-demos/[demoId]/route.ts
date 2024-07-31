import { checkEditSpacePermission, checkSpaceIdAndSpaceInEntityAreSame } from '@/app/api/helpers/space/checkEditSpacePermission';
import { MutationDeleteClickableDemoArgs, MutationUpsertClickableDemoArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

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

export async function PUT(req: NextRequest, { params: { demoId } }: { params: { demoId: string } }) {
  try {
    const args: MutationUpsertClickableDemoArgs = await req.json();
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

    return NextResponse.json({ status: 200, clickableDemo });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
  }
}
