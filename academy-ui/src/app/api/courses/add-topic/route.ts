import { MutationAddTopicArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { slugify } from '@/app/api/helpers/space/slugify';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CourseTopic } from '@/types/course/topic';

export async function POST(req: NextRequest) {
  try {
    const args: MutationAddTopicArgs = await req.json();
    const { space, decodedJwt } = await verifyCourseEditPermissions(req, args.spaceId, args.topicInfo.courseKey);

    // Fetch the current topics array
    const course = await prisma.course.findUnique({
      where: { id: args.topicInfo.courseKey },
      select: { topics: true },
    });

    if (!course) {
      throw new Error(`Course with id ${args.topicInfo.courseKey} not found`);
    }

    const newTopic: CourseTopic = {
      key: slugify(args.topicInfo.title),
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
