import { MutationUpdateTopicSummaryArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const args: MutationUpdateTopicSummaryArgs = await req.json();
    const { space, decodedJwt } = await verifyCourseEditPermissions(req, args.spaceId, args.summaryInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.summaryInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) =>
      topic.key === args.summaryInfo.topicKey
        ? {
            ...topic,
            summaries: topic.summaries?.map((summary) =>
              summary.key === args.summaryInfo.summaryKey
                ? {
                    title: args.summaryInfo.title,
                    key: args.summaryInfo.summaryKey,
                    shortTitle: args.summaryInfo.shortTitle,
                    details: args.summaryInfo.details,
                  }
                : summary
            ),
          }
        : topic
    );

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
