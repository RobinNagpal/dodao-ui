import { MoveTopicVideoInput, MutationMoveTopicVideoArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { TopicReadingModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicReadingModel';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';

export async function POST(req: NextRequest) {
  try {
    const args: MutationMoveTopicVideoArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.videoInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.videoInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      if (topic.key === args.videoInfo.topicKey) {
        const movedReadings = doMoveReadings(topic.readings || [], args.videoInfo);
        return {
          ...topic,
          readings: movedReadings,
        };
      } else {
        return topic;
      }
    });

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

function doMoveReadings(readings: TopicReadingModel[], input: MoveTopicVideoInput) {
  const readingIndex = readings.findIndex((reading) => reading.uuid === input.videoUuid);
  if (input.direction === MoveCourseItemDirection.Up) {
    if (readingIndex === 0) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(input));
    }
    const oneItemBefore = readings[readingIndex - 1];
    const reading = readings[readingIndex];
    readings[readingIndex - 1] = reading;
    readings[readingIndex] = oneItemBefore;
  } else {
    if (readingIndex === readings.length - 1) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(input));
    }
    const oneItemAfter = readings[readingIndex + 1];
    const reading = readings[readingIndex];
    readings[readingIndex + 1] = reading;
    readings[readingIndex] = oneItemAfter;
  }
  return readings;
}
