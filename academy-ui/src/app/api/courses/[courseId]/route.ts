import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest, { params: { courseId } }: { params: { courseId: string } }) {
  const args = await req.json();
  const spaceById = await getSpaceById(args.spaceId);

  const decodedJWT = await checkEditSpacePermission(spaceById, req);

  const course = await prisma.course.upsert({
    where: {
      id: courseId,
    },
    create: {
      id: courseId,
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

export async function GET(req: NextRequest, { params: { courseId } }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  return NextResponse.json({ status: 200, course });
}