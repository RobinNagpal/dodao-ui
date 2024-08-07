import { MutationCreateByteCollectionArgs } from '@/graphql/generated/generated-types';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const args: MutationCreateByteCollectionArgs = await req.json();
    const spaceById = await getSpaceById(args.input.spaceId);

    await checkEditSpacePermission(spaceById, req);

    const byteCollection = await prisma.byteCollection.create({
      data: {
        id: v4(),
        name: args.input.name,
        description: args.input.description,
        spaceId: args.input.spaceId,
        byteIds: args.input.byteIds,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: args.input.status,
        priority: args.input.priority,
        videoUrl: args.input.videoUrl,
      },
    });

    const byteCollectionWithBytes = await getByteCollectionWithItem(byteCollection);

    return NextResponse.json({ byteCollectionWithBytes }, { status: 200 });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in creatByte', {}, e as any, null, null);
    throw e;
  }
}
