import { MutationUpsertClickableDemoArgs, ClickableDemoWithSteps } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission, checkSpaceIdAndSpaceInEntityAreSame } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationUpsertClickableDemoArgs = await req.json();
  const spaceById = await getSpaceById(args.spaceId);

  checkSpaceIdAndSpaceInEntityAreSame(args.spaceId, args.spaceId);
  await checkEditSpacePermission(spaceById, req);

  const clickableDemo = await prisma.clickableDemos.upsert({
    where: {
      id: args.input.id,
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
}
