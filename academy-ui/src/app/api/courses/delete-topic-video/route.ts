import { MutationDeleteTopicVideoArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationDeleteTopicVideoArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.videoInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.videoInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) =>
      topic.key === args.videoInfo.topicKey
        ? {
            ...topic,
            readings: topic.readings?.filter((reading) => reading.uuid !== args.videoInfo.videoUuid),
          }
        : topic
    );

    const updatedCourse = await prisma.course.update({
      where: { id: args.videoInfo.courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
