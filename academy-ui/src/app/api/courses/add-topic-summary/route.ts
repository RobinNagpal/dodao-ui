import { MutationAddTopicSummaryArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { getRandomInt } from '@/app/api/helpers/space/getRandomInt';
import { slugify } from '@/app/api/helpers/space/slugify';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationAddTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.summaryInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.summaryInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const newSummaryKey = slugify(args.summaryInfo.title);
    const normalizedSummaryKey = course?.topics.some((topic) => topic.summaries?.some((summary) => summary.key === newSummaryKey))
      ? `${newSummaryKey}-${getRandomInt(1, 100)}`
      : newSummaryKey;

    const newSummary = {
      key: normalizedSummaryKey,
      shortTitle: args.summaryInfo.shortTitle,
      details: args.summaryInfo.details,
      title: args.summaryInfo.title,
    };

    const topics = course.topics.map((topic) => {
      return topic.key === args.summaryInfo.topicKey
        ? {
            ...topic,
            summaries: [...(topic.summaries || []), newSummary],
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
