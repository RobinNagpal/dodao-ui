import { CourseQuestionSubmission } from '@/app/api/helpers/deprecatedSchemas/models/course/GitCourseTopicSubmission';
import { TopicQuestionModel } from '@/app/api/helpers/deprecatedSchemas/models/course/TopicQuestionModel';
import { prisma } from '@/prisma';
import { MutationSubmitGitCourseTopicArgs } from '@/graphql/generated/generated-types';
import { verifyJwtForRequest } from '@/app/api/helpers/permissions/verifyJwtForRequest';
import { CourseStatus, TempTopicSubmissionModel, TopicStatus } from '@/types/course/submission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { JwtPayload } from 'jsonwebtoken';
import intersection from 'lodash/intersection';
import isEqual from 'lodash/isEqual';
import partition from 'lodash/partition';
import { v4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationSubmitGitCourseTopicArgs = await req.json();
  async function createNewEmptyTopicSubmission(spaceId: string, courseKey: string, decodedJwt: JwtPayload & DoDaoJwtTokenPayload, topicKey: string) {
    const existingCourseSubmission = await prisma.courseSubmission.findFirstOrThrow({
      where: {
        spaceId: spaceId,
        courseKey: courseKey,
        createdBy: decodedJwt.username,
        status: {
          not: CourseStatus.Submitted,
        },
      },
    });

    const submission: TempTopicSubmissionModel = {
      uuid: v4(),
      questions: [],
      explanations: [],
      readings: [],
      summaries: [],
      topicKey: topicKey,
      courseKey: courseKey,
      status: TopicStatus.Submitted,
    };

    return await prisma.courseTopicSubmission.create({
      data: {
        uuid: v4(),
        courseKey: courseKey,
        courseSubmissionUuid: existingCourseSubmission.uuid,
        createdAt: new Date(),
        createdBy: decodedJwt.username,
        isLatestSubmission: true,
        questionsAttempted: 0,
        questionsCorrect: 0,
        questionsIncorrect: 0,
        questionsSkipped: 0,
        submission: submission,
        spaceId: spaceId,
        topicKey: topicKey,
        updatedAt: new Date(),
        status: TopicStatus.Submitted,
        correctAnswers: [],
      },
    });
  }

  try {
    const spaceId = args.spaceId;
    const courseKey = args.gitCourseTopicSubmission.courseKey;
    const topicKey = args.gitCourseTopicSubmission.topicKey;
    const submissionUuid = args.gitCourseTopicSubmission.uuid;

    const { space, decodedJwt } = await verifyJwtForRequest(req, args.spaceId);

    const course = await prisma.course.findUniqueOrThrow({
      where: {
        id: courseKey,
      },
    });

    const topicModel = course.topics.find((topic) => topic.key === topicKey);

    const topicSubmission = await prisma.courseTopicSubmission.findFirst({
      where: {
        uuid: submissionUuid,
        isLatestSubmission: true,
      },
    });

    if (!topicSubmission && course.topics.find((t) => t.key === topicKey)?.questions?.length === 0) {
      return NextResponse.json({ status: 200, body: await createNewEmptyTopicSubmission(spaceId, courseKey, decodedJwt, topicKey) });
    }

    if (!topicSubmission) {
      throw new Error(`No topic submission found: ${spaceId} - ${courseKey} - ${topicKey} - ${decodedJwt.accountId}`);
    }

    const existingCourseSubmission = await prisma.courseSubmission.findFirstOrThrow({
      where: {
        uuid: topicSubmission.courseSubmissionUuid,
      },
    });

    if (!topicModel) {
      throw new Error(`No topic found: ${spaceId} - ${courseKey} - ${topicKey}`);
    }

    const submissionQuestionsMap: { [uuid in string]: CourseQuestionSubmission } = Object.fromEntries(
      topicSubmission.submission.questions.map((q: CourseQuestionSubmission) => [q.uuid, q])
    );

    const correctAndIncorrectQuestions = partition(topicModel.questions, (q: TopicQuestionModel) => {
      const submissionAnswers = submissionQuestionsMap[q.uuid]?.answers;
      if (!submissionAnswers?.length) {
        throw new Error(`No answer found for question: ${spaceId} - ${courseKey} - ${topicKey} - ${q.uuid}`);
      }

      // We do the intersection to make sure there are no obsolete answer keys. There was a bug which didn't delete the obsolete answer keys
      const selectedAnswers = intersection(q.answerKeys, submissionAnswers);
      return isEqual(q.answerKeys.sort(), selectedAnswers.sort());
    });

    // This is done just to refresh the updated_at
    await prisma.courseSubmission.update({
      where: {
        uuid: existingCourseSubmission.uuid,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    await prisma.courseTopicSubmission.update({
      where: {
        uuid: submissionUuid,
      },
      data: {
        questionsAttempted: topicSubmission.submission.questions.length,
        questionsCorrect: correctAndIncorrectQuestions[0].length,
        questionsIncorrect: correctAndIncorrectQuestions[1].length,
        questionsSkipped: 0,
        correctAnswers: (topicModel.questions || []).map((q) => ({ uuid: q.uuid, answerKeys: q.answerKeys })),
        status: TopicStatus.Submitted,
      },
    });

    const courseSubmission = await prisma.courseSubmission.findFirstOrThrow({ where: { spaceId, courseKey, createdBy: decodedJwt.username } });
    const topicSubmissions = await prisma.courseTopicSubmission.findMany({ where: { spaceId, courseKey, createdBy: decodedJwt.username } });

    return NextResponse.json({ status: 200, body: { ...courseSubmission, topicSubmissions } });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export const POST = withErrorHandling(postHandler);
