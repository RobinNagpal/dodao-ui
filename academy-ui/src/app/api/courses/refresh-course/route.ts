import { MutationRefreshGitCourseArgs } from '@/graphql/generated/generated-types';
import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationRefreshGitCourseArgs = await req.json();
  try {
    const { space } = await verifySpaceEditPermissions(req, args.spaceId);

    const rawGitCourseModel = await prisma.course.findFirstOrThrow({
      where: {
        spaceId: space.id,
        key: args.courseKey,
      },
    });

    // Need to correct this logic
    // await pullGitCourseAndSetInRedis(space, rawGitCourseModel);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error((e as any)?.response?.data);
    NextResponse.json({ success: false, error: e });
  }
}
