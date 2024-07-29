import { MutationDeleteAndPullCourseRepoArgs } from '@/graphql/generated/generated-types';
import { getCourseRepoInfo } from '@/app/api/helpers/course/getCourseHelper';
import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { prisma } from '@/prisma';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationDeleteAndPullCourseRepoArgs = await req.json();
  const { space, decodedJwt } = await verifySpaceEditPermissions(req, args.spaceId);
  const rawCourse = await prisma.course.findFirstOrThrow({
    where: {
      spaceId: space.id,
      key: args.courseKey,
    },
  });

  // Need to correct the logic
  //   const courseRepoInfo = getCourseRepoInfo(space.id, rawCourse.courseRepoUrl);

  //   fs.rmSync(courseRepoInfo.repositoryPath, { recursive: true, force: true });

  //   await pullGitCourseAndSetInRedis(space, rawCourse);

  //   return await readGitCourse(space, rawCourse);
  return NextResponse.json({ success: true });
}
