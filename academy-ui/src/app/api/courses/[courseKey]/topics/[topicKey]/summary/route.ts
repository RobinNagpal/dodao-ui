import {
  MutationAddTopicSummaryArgs,
  MutationDeleteTopicSummaryArgs,
  MutationUpdateTopicSummaryArgs,
  MoveTopicSummaryInput,
  MutationMoveTopicSummaryArgs,
} from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { TopicSummaryModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicSummaryModel';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { getRandomInt } from '@/app/api/helpers/space/getRandomInt';
import { slugify } from '@/app/api/helpers/space/slugify';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

async function postHandler(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationAddTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
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
      return topic.key === topicKey
        ? {
            ...topic,
            summaries: [...(topic.summaries || []), newSummary],
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

async function deleteHandler(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationDeleteTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      return topic.key === topicKey
        ? {
            ...topic,
            summaries: topic.summaries?.filter((summary) => summary.key !== args.summaryInfo.summaryKey),
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

async function putHander(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationUpdateTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) =>
      topic.key === topicKey
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
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

async function patchHandler(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationMoveTopicSummaryArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      if (topic.key === topicKey) {
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
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
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

export const POST = withErrorHandling(postHandler);
export const DELETE = withErrorHandling(deleteHandler);
export const PUT = withErrorHandling(putHander);
export const PATCH = withErrorHandling(patchHandler);
