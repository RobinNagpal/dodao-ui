import { MutationDeleteTopicQuestionArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const args: MutationDeleteTopicQuestionArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.questionInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.questionInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      return topic.key === args.questionInfo.topicKey
        ? {
            ...topic,
            questions: topic.questions?.filter((q) => q.uuid !== args.questionInfo.questionUuid),
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: args.questionInfo.courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
