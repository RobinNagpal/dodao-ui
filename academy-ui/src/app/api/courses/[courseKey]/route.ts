import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

async function postHandler(req: NextRequest, { params: { courseKey } }: { params: { courseKey: string } }) {
  const args = await req.json();
  const spaceById = await getSpaceById(args.spaceId);

  const decodedJWT = await checkEditSpacePermission(spaceById, req);

  const course = await prisma.course.upsert({
    where: {
      id: courseKey,
    },
    create: {
      id: courseKey,
      spaceId: args.space.id,
      courseKey: args.course.key,
      createdBy: decodedJWT!.accountId,
      courseAdmins: [],
      ...args.course,
    },
    update: {
      ...args.course,
    },
  });
  return NextResponse.json({ status: 200, course });
}

async function getHandler(req: NextRequest, { params: { courseKey } }: { params: { courseKey: string } }) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseKey,
    },
  });

  return NextResponse.json({ status: 200, course });
}

export const POST = withErrorHandling(postHandler);
export const GET = withErrorHandling(getHandler);
