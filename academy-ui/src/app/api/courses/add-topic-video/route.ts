import { MutationAddTopicVideoArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationAddTopicVideoArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.videoInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.videoInfo.courseKey },
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
      return topic.key === args.videoInfo.topicKey
        ? {
            ...topic,
            readings: [...(topic.readings || []), newVideo],
          }
        : topic;
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
