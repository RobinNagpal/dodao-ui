import { MoveTopicExplanationInput, MutationMoveTopicExplanationArgs } from '@/graphql/generated/generated-types';
import { TopicExplanationModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicExplanationModel';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const args: MutationMoveTopicExplanationArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.explanationInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.explanationInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      if (topic.key === args.explanationInfo.topicKey) {
        const movedExplanations = doMoveExplanations(topic.explanations || [], args.explanationInfo);
        return {
          ...topic,
          explanations: movedExplanations,
        };
      } else {
        return topic;
      }
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

function doMoveExplanations(explanations: TopicExplanationModel[], input: MoveTopicExplanationInput) {
  const explanationIndex = explanations.findIndex((explanation) => explanation.key === input.explanationKey);
  if (input.direction === MoveCourseItemDirection.Up) {
    if (explanationIndex === 0) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify({ input, explanation: explanations?.[explanationIndex] }));
    }
    const oneItemBefore = explanations[explanationIndex - 1];
    const explanation = explanations[explanationIndex];
    explanations[explanationIndex - 1] = explanation;
    explanations[explanationIndex] = oneItemBefore;
  } else {
    if (explanationIndex === explanations.length - 1) {
      throw new Error('Cannot move up as its already at the last place :' + JSON.stringify({ input, explanation: explanations?.[explanationIndex] }));
    }
    const oneItemAfter = explanations[explanationIndex + 1];
    const explanation = explanations[explanationIndex];
    explanations[explanationIndex + 1] = explanation;
    explanations[explanationIndex] = oneItemAfter;
  }
  return explanations;
}
