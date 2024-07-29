import { MutationDeleteTopicSummaryArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationDeleteTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.summaryInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.summaryInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      return topic.key === args.summaryInfo.topicKey
        ? {
            ...topic,
            summaries: topic.summaries?.filter((summary) => summary.key !== args.summaryInfo.summaryKey),
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: args.summaryInfo.courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
