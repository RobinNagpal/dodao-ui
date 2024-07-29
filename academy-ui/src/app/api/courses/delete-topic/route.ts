import { MutationDeleteTopicArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationDeleteTopicArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.topicInfo.courseKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: args.topicInfo.courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${args.topicInfo.courseKey} not found`);
    }

    // Remove the topic with the specified key from the array
    const updatedTopics = course.topics.filter((topic) => topic.key !== args.topicInfo.topicKey);

    // Save the updated array back to the database
    const updatedTopic = await prisma.course.update({
      where: { id: args.topicInfo.courseKey },
      data: { topics: updatedTopics },
    });

    return NextResponse.json({ status: 200, updatedTopic });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
