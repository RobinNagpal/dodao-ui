import { MutationUpsertGitCourseTopicSubmissionArgs } from '@/graphql/generated/generated-types';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import {
  CourseQuestionSubmission,
  ExplanationSubmission,
  ReadingSubmission,
  SummarySubmission,
  TempTopicSubmissionModel,
  TopicItemStatus,
  TopicStatus,
} from '@/types/course/submission';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationUpsertGitCourseTopicSubmissionArgs = await req.json();
  const {
    spaceId,
    gitCourseTopicSubmission: { courseKey, topicKey },
  } = args;

  const decodedJWT = await getDecodedJwtFromContext(req);

  const existingCourseSubmission = await prisma.courseSubmission.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      createdBy: decodedJWT!.username,
      courseKey,
    },
  });

  await prisma.courseSubmission.update({
    where: {
      uuid: existingCourseSubmission.uuid,
    },
    data: {},
  });

  const existingTopicSubmission = await prisma.courseTopicSubmission.findFirst({
    where: {
      courseKey,
      topicKey: args.gitCourseTopicSubmission.topicKey,
    },
  });

  const topicSubmission: TempTopicSubmissionModel = {
    uuid: args.gitCourseTopicSubmission.uuid,
    courseKey: args.gitCourseTopicSubmission.courseKey,
    topicKey: args.gitCourseTopicSubmission.topicKey,
    explanations: args.gitCourseTopicSubmission.explanations as ExplanationSubmission[],
    questions: args.gitCourseTopicSubmission.questions as CourseQuestionSubmission[],
    readings: args.gitCourseTopicSubmission.readings.map(
      (reading): ReadingSubmission => ({
        uuid: reading.uuid,
        status: reading.status as TopicItemStatus,
      })
    ),
    summaries: args.gitCourseTopicSubmission.summaries as SummarySubmission[],
    status: args.gitCourseTopicSubmission.status as TopicStatus,
  };

  if (existingTopicSubmission) {
    await prisma.courseTopicSubmission.update({
      where: {
        uuid: existingTopicSubmission.uuid,
      },
      data: {
        isLatestSubmission: existingCourseSubmission.isLatestSubmission,
        topicKey: args.gitCourseTopicSubmission.topicKey,
        status: args.gitCourseTopicSubmission.status,
        spaceId: spaceId,
        createdBy: decodedJWT!.username,
        courseSubmissionUuid: existingCourseSubmission.uuid,
        submission: topicSubmission,
      },
    });
  } else {
    await prisma.courseTopicSubmission.create({
      data: {
        uuid: args.gitCourseTopicSubmission.uuid,
        courseKey: args.gitCourseTopicSubmission.courseKey,
        createdAt: new Date(),
        isLatestSubmission: existingCourseSubmission.isLatestSubmission,
        topicKey: args.gitCourseTopicSubmission.topicKey,
        status: args.gitCourseTopicSubmission.status,
        spaceId: spaceId,
        createdBy: decodedJWT!.accountId,
        courseSubmissionUuid: existingCourseSubmission.uuid,
        submission: topicSubmission,
      },
    });
  }

  const courseSubmission = await prisma.courseSubmission.findFirstOrThrow({ where: { spaceId, courseKey, createdBy: decodedJWT?.username } });
  const topicSubmissions = await prisma.courseTopicSubmission.findMany({ where: { spaceId, courseKey, createdBy: decodedJWT?.username } });

  return NextResponse.json({ body: { ...courseSubmission, topicSubmissions } }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
