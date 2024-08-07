import { CourseStatus, TopicStatus } from '@/app/api/helpers/deprecatedSchemas/models/course/GitCourseTopicSubmission';
import { MutationDeleteGitCourseSubmissionArgs } from '@/graphql/generated/generated-types';
import { verifyJwtForRequest } from '@/app/api/helpers/permissions/verifyJwtForRequest';
import { CourseSubmission, CourseTopicSubmission } from '@prisma/client';
import { MutationSubmitGitCourseArgs } from '@/graphql/generated/generated-types';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function deleteHandler(req: NextRequest, { params: { courseKey } }: { params: { courseKey: string } }) {
  const args: MutationDeleteGitCourseSubmissionArgs = await req.json();
  const { decodedJwt } = await verifyJwtForRequest(req, args.spaceId);

  await prisma.courseTopicSubmission.deleteMany({
    where: {
      createdBy: decodedJwt.username,
      courseKey: courseKey,
      spaceId: args.spaceId,
    },
  });

  await prisma.courseSubmission.deleteMany({
    where: {
      createdBy: decodedJwt.username,
      courseKey: courseKey,
      spaceId: args.spaceId,
    },
  });

  return NextResponse.json({ body: true }, { status: 200 });
}

async function postHandler(req: NextRequest, { params: { courseKey } }: { params: { courseKey: string } }) {
  try {
    const args: MutationSubmitGitCourseArgs = await req.json();
    const spaceId = args.spaceId;
    const courseSubmissionUuid = args.input.uuid;

    const { space, decodedJwt } = await verifyJwtForRequest(req, args.spaceId);

    const existingSubmission = await prisma.courseSubmission.findFirstOrThrow({
      where: {
        uuid: courseSubmissionUuid,
      },
    });

    if (!existingSubmission) {
      throw new Error(`No submissionFound found: ${spaceId} - ${courseSubmissionUuid}`);
    }

    if (existingSubmission.status === CourseStatus.Submitted) {
      throw new Error(`Already Submitted: ${spaceId} - ${existingSubmission.courseKey} - ${decodedJwt.accountId} -- ${args.input.uuid}`);
    }

    const courseKey = existingSubmission.courseKey;

    const topicSubmissions = await prisma.courseTopicSubmission.findMany({
      where: {
        spaceId: spaceId,
        courseKey: courseKey,
        createdBy: decodedJwt.username,
      },
    });

    topicSubmissions.forEach((ts: CourseTopicSubmission) => {
      if (ts.status !== TopicStatus.Submitted) {
        throw new Error(`Topic not submitted: ${spaceId} - ${courseKey} - ${decodedJwt.username}`);
      }
    });

    const course = await prisma.course.findUniqueOrThrow({
      where: {
        id: courseKey,
      },
    });

    course.topics.forEach((topic) => {
      if (topic.questions?.length && !topicSubmissions.find((t: CourseTopicSubmission) => t.topicKey === topic.key)) {
        throw new Error(`No topic submission found: ${spaceId} - ${courseKey} - ${decodedJwt.username}`);
      }
    });

    const reduceInitValue: CourseSubmission = {
      ...existingSubmission,
      questionsAttempted: 0,
      questionsCorrect: 0,
      questionsIncorrect: 0,
      questionsSkipped: 0,
      status: CourseStatus.Submitted,
    };

    const courseSubmission = topicSubmissions.reduce((courseSubmission: CourseSubmission, topicSubmission: CourseTopicSubmission): CourseSubmission => {
      return {
        ...courseSubmission,
        questionsAttempted: (courseSubmission.questionsAttempted || 0) + (topicSubmission.questionsAttempted ?? 0),
        questionsCorrect: (courseSubmission.questionsCorrect || 0) + (topicSubmission.questionsCorrect || 0),
        questionsIncorrect: (courseSubmission.questionsIncorrect || 0) + (topicSubmission.questionsIncorrect || 0),
        questionsSkipped: (courseSubmission.questionsSkipped || 0) + (topicSubmission.questionsSkipped || 0),
      };
    }, reduceInitValue);

    const savedSubmission = await prisma.courseSubmission.update({
      where: {
        uuid: courseSubmissionUuid,
      },
      data: {
        ...courseSubmission,
      },
    });

    return NextResponse.json({ body: { ...savedSubmission, topicSubmissions } }, { status: 200 });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export const POST = withErrorHandling(postHandler);
export const DELETE = withErrorHandling(deleteHandler);
