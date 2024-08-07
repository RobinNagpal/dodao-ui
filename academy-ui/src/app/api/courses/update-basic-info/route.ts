import { CourseBasicInfoInput, MutationUpdateCourseBasicInfoArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { Space } from '@prisma/client';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationUpdateCourseBasicInfoArgs = await req.json();
    const { courseBasicInfo } = args;
    const { space, decodedJwt } = await verifyCourseEditPermissions(req, args.spaceId, args.courseBasicInfo.key);

    const course = await prisma.course.update({
      where: {
        id: courseBasicInfo.key,
      },
      data: {
        title: courseBasicInfo.title,
        summary: courseBasicInfo.summary,
        details: courseBasicInfo.details,
        publishStatus: courseBasicInfo.publishStatus,
        thumbnail: courseBasicInfo.thumbnail,
        duration: courseBasicInfo.duration,
        highlights: courseBasicInfo.highlights,
        courseAdmins: courseBasicInfo.courseAdmins.map((a) => a.toLowerCase()),
        coursePassContent: courseBasicInfo.coursePassContent || undefined,
        topicConfig: JSON.stringify(courseBasicInfo.topicConfig) || undefined,
      },
    });

    return NextResponse.json({ course }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

async function updateCourseBasicInfo(accountId: string, space: Space, courseBasicInfo: CourseBasicInfoInput) {
  const response = await prisma.course.update({
    where: {
      id: courseBasicInfo.key,
    },
    data: {
      title: courseBasicInfo.title,
      summary: courseBasicInfo.summary,
      details: courseBasicInfo.details,
      publishStatus: courseBasicInfo.publishStatus,
      thumbnail: courseBasicInfo.thumbnail,
      duration: courseBasicInfo.duration,
      highlights: courseBasicInfo.highlights,
      courseAdmins: courseBasicInfo.courseAdmins.map((a) => a.toLowerCase()),
      coursePassContent: courseBasicInfo.coursePassContent || undefined,
      topicConfig: JSON.stringify(courseBasicInfo.topicConfig) || undefined,
    },
  });
}
