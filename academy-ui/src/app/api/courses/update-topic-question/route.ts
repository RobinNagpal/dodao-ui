import { MutationUpdateTopicQuestionArgs } from '@/graphql/generated/generated-types';
import { verifyCourseEditPermissions } from '@/app/api/helpers/permissions/verifyCourseEditPermissions';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: NextRequest) {
  try {
    const args: MutationUpdateTopicQuestionArgs = await req.json();
    await verifyCourseEditPermissions(req, args.spaceId, args.questionInfo.courseKey);

    const course = await prisma.course.findUnique({
      where: { id: args.questionInfo.courseKey },
      select: { topics: true },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const topics = course.topics.map((topic) =>
      topic.key === args.questionInfo.topicKey
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
      where: { id: args.questionInfo.courseKey },
      data: { topics },
    });

    return NextResponse.json({ status: 200, updatedCourse });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
