import {
  MutationAddTopicVideoArgs,
  MutationDeleteTopicVideoArgs,
  MutationUpdateTopicVideoArgs,
  MoveTopicVideoInput,
  MutationMoveTopicVideoArgs,
} from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { TopicReadingModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicReadingModel';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationAddTopicVideoArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const newVideo = {
      uuid: uuidv4(),
      shortTitle: args.videoInfo.shortTitle,
      details: args.videoInfo.details,
      title: args.videoInfo.title,
      type: 'YoutubeVideo',
      url: args.videoInfo.url,
      subTopics: [],
    };

    const topics = course.topics.map((topic) => {
      return topic.key === topicKey
        ? {
            ...topic,
            readings: [...(topic.readings || []), newVideo],
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function DELETE(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationDeleteTopicVideoArgs = await req.json();
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
            readings: topic.readings?.filter((reading) => reading.uuid !== args.videoInfo.videoUuid),
          }
        : topic
    );

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function PUT(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationUpdateTopicVideoArgs = await req.json();
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
            readings: topic.readings?.map((reading) =>
              reading.uuid === args.videoInfo.videoUuid
                ? {
                    uuid: args.videoInfo.videoUuid,
                    shortTitle: args.videoInfo.shortTitle,
                    details: args.videoInfo.details,
                    title: args.videoInfo.title,
                    type: 'YoutubeVideo',
                    url: args.videoInfo.url,
                    subTopics: [],
                  }
                : reading
            ),
          }
        : topic
    );

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function PATCH(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationMoveTopicVideoArgs = await req.json();
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
      where: { id: courseKey },
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
