import {
  MutationAddTopicExplanationArgs,
  MutationDeleteTopicExplanationArgs,
  MutationUpdateTopicExplanationArgs,
  MoveTopicExplanationInput,
  MutationMoveTopicExplanationArgs,
} from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { getRandomInt } from '@/app/api/helpers/space/getRandomInt';
import { prisma } from '@/prisma';
import { slugify } from '@/app/api/helpers/space/slugify';
import { TopicExplanationModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicExplanationModel';
import { MoveCourseItemDirection } from '@dodao/web-core/types/deprecated/models/enums';

export async function POST(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationAddTopicExplanationArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
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
      return topic.key === topicKey
        ? {
            ...topic,
            explanations: [...(topic.explanations || []), newExplanation],
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function DELETE(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationDeleteTopicExplanationArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      return topic.key === topicKey
        ? {
            ...topic,
            explanations: topic.explanations?.filter((explanation) => explanation.key !== args.explanationInfo.explanationKey),
          }
        : topic;
    });

    const updatedCourse = await prisma.course.update({
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function PUT(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationUpdateTopicExplanationArgs = await req.json();
    const { space, decodedJwt } = await verifyCourseEditPermissions(req, args.spaceId, courseKey);

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
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export async function PATCH(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationMoveTopicExplanationArgs = await req.json();
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
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
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
