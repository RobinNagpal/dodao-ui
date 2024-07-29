import { MutationAddTopicExplanationArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { getRandomInt } from '@/app/api/helpers/space/getRandomInt';
import { prisma } from '@/prisma';
import { slugify } from '@/app/api/helpers/space/slugify';

export async function POST(req: NextRequest) {
  try {
    const args: MutationAddTopicExplanationArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.explanationInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.explanationInfo.courseKey },
      select: { topics: true },
    }); 
    if (!course) {
      throw new Error('Course not found');
    }

    const newExplanationKey = slugify(args.explanationInfo.title);
    const normalizedExplanationKey = course?.topics.some((topic) => topic.explanations?.some((explanation) => explanation.key === newExplanationKey))
      ? `${newExplanationKey}-${getRandomInt(1, 100)}`
      : newExplanationKey;

    const newExplanation = {
      key: normalizedExplanationKey,
      shortTitle: args.explanationInfo.shortTitle,
      details: args.explanationInfo.details,
      title: args.explanationInfo.title,
    };

    const topics = course.topics.map((topic) => {
      return topic.key === args.explanationInfo.topicKey
        ? {
            ...topic,
            explanations: [...(topic.explanations || []), newExplanation],
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: args.explanationInfo.courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
