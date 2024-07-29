import { MoveTopicSummaryInput, MutationMoveTopicSummaryArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { TopicSummaryModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicSummaryModel';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';

export async function POST(req: NextRequest) {
  try {
    const args: MutationMoveTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.summaryInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.summaryInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      if (topic.key === args.summaryInfo.topicKey) {
        const movedSummaries = doMoveSummaries(topic.summaries || [], args.summaryInfo);
        return {
          ...topic,
          summaries: movedSummaries,
        };
      } else {
        return topic;
      }
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

function doMoveSummaries(summaries: TopicSummaryModel[], input: MoveTopicSummaryInput) {
  const summaryIndex = summaries.findIndex((summary) => summary.key === input.summaryKey);
  if (input.direction === MoveCourseItemDirection.Up) {
    if (summaryIndex === 0) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(input));
    }
    const oneItemBefore = summaries[summaryIndex - 1];
    const summary = summaries[summaryIndex];
    summaries[summaryIndex - 1] = summary;
    summaries[summaryIndex] = oneItemBefore;
  } else {
    if (summaryIndex === summaries.length - 1) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(input));
    }
    const oneItemAfter = summaries[summaryIndex + 1];
    const summary = summaries[summaryIndex];
    summaries[summaryIndex + 1] = summary;
    summaries[summaryIndex] = oneItemAfter;
  }
  return summaries;
}
