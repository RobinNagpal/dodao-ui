import { MutationUpdateTopicExplanationArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const args: MutationUpdateTopicExplanationArgs = await req.json();
    const { space, decodedJwt } = await verifyCourseEditPermissions(req, args.spaceId, args.explanationInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.explanationInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) =>
      topic.key === args.explanationInfo.topicKey
        ? {
            ...topic,
            explanations: topic.explanations?.map((explanation) =>
              explanation.key === args.explanationInfo.explanationKey
                ? {
                    key: args.explanationInfo.explanationKey,
                    shortTitle: args.explanationInfo.shortTitle,
                    details: args.explanationInfo.details,
                    title: args.explanationInfo.title,
                  }
                : explanation
            ),
          }
        : topic
    );

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
