import { MoveTopicQuestionInput, MutationMoveTopicQuestionArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { TopicQuestionModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicQuestionModel';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationMoveTopicQuestionArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.questionInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.questionInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) => {
      if (topic.key === args.questionInfo.topicKey) {
        const movedQuestions = doMoveQuestions(topic.questions || [], args.questionInfo);
        return {
          ...topic,
          questions: movedQuestions,
        };
      } else {
        return topic;
      }
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

function doMoveQuestions(questions: TopicQuestionModel[], input: MoveTopicQuestionInput) {
  const questionIndex = questions.findIndex((question) => question.uuid === input.questionUuid);
  if (input.direction === MoveCourseItemDirection.Up) {
    if (questionIndex === 0) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(input));
    }
    const oneItemBefore = questions[questionIndex - 1];
    const question = questions[questionIndex];
    questions[questionIndex - 1] = question;
    questions[questionIndex] = oneItemBefore;
  } else {
    if (questionIndex === questions.length - 1) {
      throw new Error('Cannot move up as its already at the top place :' + JSON.stringify(input));
    }
    const oneItemAfter = questions[questionIndex + 1];
    const question = questions[questionIndex];
    questions[questionIndex + 1] = question;
    questions[questionIndex] = oneItemAfter;
  }
  return questions;
}
