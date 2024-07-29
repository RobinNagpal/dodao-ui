import { MutationMoveTopicArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationMoveTopicArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.topicInfo.topicKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: args.topicInfo.courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${args.topicInfo.courseKey} not found`);
    }

    const topics = course.topics;

    // Find the topic to move
    const topicIndex = course.topics.findIndex((topic) => topic.key === args.topicInfo.topicKey);
    if (topicIndex === -1) {
      throw new Error(`Topic with key ${args.topicInfo.topicKey} not found`);
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
      where: { id: args.topicInfo.courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
