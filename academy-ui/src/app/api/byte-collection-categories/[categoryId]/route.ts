import {
  ByteCollection as ByteCollectionGraphql,
  MutationUpsertByteCollectionCategoryArgs,
  QueryByteCollectionCategoryWithByteCollectionsArgs,
} from '@/graphql/generated/generated-types';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { prisma } from '@/prisma';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission, checkSpaceIdAndSpaceInEntityAreSame } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params: { categoryId } }: { params: { categoryId: string } }) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, message: 'Space ID is required' });

  const byteCollectionCategory = await prisma.byteCollectionCategory.findUniqueOrThrow({
    where: {
      id: categoryId,
    },
  });

  const byteCollectionArr: ByteCollectionGraphql[] = [];

  for (const byteCollectionId of byteCollectionCategory.byteCollectionIds) {
    const byteCollection = await prisma.byteCollection.findFirstOrThrow({
      where: {
        spaceId: spaceId,
        id: byteCollectionId,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    byteCollectionArr.push(await getByteCollectionWithItem(byteCollection));
  }

  return NextResponse.json({
    status: 200,
    byteCollectionCategoryWithByteCollections: {
      id: byteCollectionCategory.id,
      name: byteCollectionCategory.name,
      excerpt: byteCollectionCategory.excerpt,
      imageUrl: byteCollectionCategory.imageUrl,
      byteCollections: byteCollectionArr,
      creator: byteCollectionCategory.creator,
      status: byteCollectionCategory.status,
      priority: byteCollectionCategory.priority,
      archive: !!byteCollectionCategory.archive!,
    },
  });
}

async function postHandler(req: NextRequest, { params: { categoryId } }: { params: { categoryId: string } }) {
  const args: MutationUpsertByteCollectionCategoryArgs = await req.json();
  const spaceById = await getSpaceById(args.input.spaceId);

  checkSpaceIdAndSpaceInEntityAreSame(args.spaceId, args.input.spaceId);
  const user = await checkEditSpacePermission(spaceById, req);

  const byteCollectionCategory = await prisma.byteCollectionCategory.upsert({
    where: {
      id: categoryId,
    },
    create: {
      id: categoryId,
      name: args.input.name,
      spaceId: args.input.spaceId,
      byteCollectionIds: args.input.byteCollectionIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: args.input.imageUrl,
      creator: user!.username,
      excerpt: args.input.excerpt,
      status: args.input.status,
      priority: args.input.priority,
    },
    update: {
      name: args.input.name,
      byteCollectionIds: args.input.byteCollectionIds,
      updatedAt: new Date(),
      imageUrl: args.input.imageUrl,
      excerpt: args.input.excerpt,
      status: args.input.status,
      priority: args.input.priority,
    },
  });

  return NextResponse.json({ status: 200, byteCollectionCategory });
}

async function deleteHandler(req: NextRequest, { params: { categoryId } }: { params: { categoryId: string } }) {
  const args: QueryByteCollectionCategoryWithByteCollectionsArgs = await req.json();
  const spaceById = await getSpaceById(args.spaceId);

  await checkEditSpacePermission(spaceById, req);

  try {
    const updatedbyteCollectionCategory = await prisma.byteCollectionCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        archive: true,
      },
    });

    return NextResponse.json({ status: 200, updatedbyteCollectionCategory });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
export const DELETE = withErrorHandling(deleteHandler);
