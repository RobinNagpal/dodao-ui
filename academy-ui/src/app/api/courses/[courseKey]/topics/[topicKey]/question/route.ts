import {
  MutationAddTopicQuestionArgs,
  MutationDeleteTopicQuestionArgs,
  MutationUpdateTopicQuestionArgs,
  MoveTopicQuestionInput,
  MutationMoveTopicQuestionArgs,
} from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { TopicQuestionModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicQuestionModel';
import { MoveCourseItemDirection } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest, { params: { courseKey, topicKey } }: { params: { courseKey: string; topicKey: string } }) {
  try {
    const args: MutationAddTopicQuestionArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const newQuestion = {
      uuid: uuidv4(),
      type: args.questionInfo.questionType,
      content: args.questionInfo.content,
      hint: args.questionInfo.hint,
      explanation: args.questionInfo.explanation,
      answerKeys: args.questionInfo.answerKeys,
      subTopics: [],
      difficultyLevel: 'Medium',
      choices: args.questionInfo.choices,
    };

    const topics = course.topics.map((topic) => {
      return topic.key === topicKey
        ? {
            ...topic,
            questions: [...(topic.questions || []), newQuestion],
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
    const args: MutationDeleteTopicQuestionArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

    const course = await prisma.course.findUnique({
      where: { id: courseKey },
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
    const args: MutationUpdateTopicQuestionArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, courseKey);

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
            questions: topic.questions?.map((question) =>
              question.uuid === args.questionInfo.questionUuid
                ? {
                    uuid: args.questionInfo.questionUuid,
                    type: args.questionInfo.questionType,
                    content: args.questionInfo.content,
                    hint: args.questionInfo.hint,
                    explanation: args.questionInfo.explanation,
                    answerKeys: args.questionInfo.answerKeys,
                    subTopics: [],
                    difficultyLevel: 'Medium',
                    choices: args.questionInfo.choices,
                  }
                : question
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
    const args: MutationMoveTopicQuestionArgs = await req.json();
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
      where: { id: courseKey },
      data: { topics },
    });

    return NextResponse.json({ updatedCourse }, { status: 200 });
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
