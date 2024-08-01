import { MutationAddTopicArgs, MutationDeleteTopicArgs, MutationUpdateTopicBasicInfoArgs, MutationMoveTopicArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CourseTopic } from '@/types/course/topic';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';

export async function POST(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationAddTopicArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${courseKey} not found`);
    }

    const newTopic: CourseTopic = {
      key: topicKey,
      title: args.topicInfo.title,
      details: args.topicInfo.details,
      explanations: [],
      readings: [],
      summaries: [],
      questions: [],
    };

    // Add the new topic to the array
    const updatedTopics = [...course.topics, newTopic];

    // Save the updated array back to the database
    const updatedCourse = await prisma.course.update({
      where: { id: args.topicInfo.courseKey },
      data: { topics: updatedTopics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function DELETE(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationDeleteTopicArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${courseKey} not found`);
    }

    // Remove the topic with the specified key from the array
    const updatedTopics = course.topics.filter((topic) => topic.key !== topicKey);

    // Save the updated array back to the database
    const updatedTopic = await prisma.course.update({
      where: { id: courseKey },
      data: { topics: updatedTopics },
    });

    return NextResponse.json({ status: 200, updatedTopic });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function PUT(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationUpdateTopicBasicInfoArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${courseKey} not found`);
    }

    // Update the specific item in the array
    const updatedTopics = course.topics.map((topic) => {
      if (topic.key === topicKey) {
        return { ...topic, details: args.topicInfo.details, title: args.topicInfo.title };
      }
      return topic;
    });

    // Save the updated array back to the database
    const updatedTopic = await prisma.course.update({
      where: { id: courseKey },
      data: { topics: updatedTopics },
    });

    return NextResponse.json({ status: 200, updatedTopic });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function PATCH(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationMoveTopicArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, topicKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${courseKey} not found`);
    }

    const topics = course.topics;

    // Find the topic to move
    const topicIndex = course.topics.findIndex((topic) => topic.key === topicKey);
    if (topicIndex === -1) {
      throw new Error(`Topic with key ${topicKey} not found`);
    }
    if (args.topicInfo.direction === MoveCourseItemDirection.Up) {
      if (topicIndex === 0) {
        throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(args.topicInfo));
      }
      const oneItemBefore = topics[topicIndex - 1];
      const topic = topics[topicIndex];
      topics[topicIndex - 1] = topic;
      topics[topicIndex] = oneItemBefore;
    } else {
      if (topicIndex === topics.length - 1) {
        throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(args.topicInfo));
      }
      const oneItemAfter = topics[topicIndex + 1];
      const topic = topics[topicIndex];
      topics[topicIndex + 1] = topic;
      topics[topicIndex] = oneItemAfter;
    }

    // Save the updated array back to the database
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
