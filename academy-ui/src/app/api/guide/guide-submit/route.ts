import { isQuestion, isUserDiscordConnect, isUserInput } from '@/app/api/helpers/deprecatedSchemas/helpers/stepItemTypes';
import { GuideModel, GuideQuestion, UserInput } from '@/app/api/helpers/deprecatedSchemas/models/GuideModel';
import {
  GuideSubmissionInput,
  GuideSubmissionResult,
  MutationSubmitGuideArgs,
  GuideSubmission as GuideSubmissionGraphql,
} from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { SubmissionItemInfo, UserGuideQuestionSubmission, UserGuideStepSubmission } from '@/app/api/helpers/types/guideSubmisstion';
import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { GuideSubmission } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import intersection from 'lodash/intersection';
import isEqual from 'lodash/isEqual';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

function getGuideStepSubmissionMap(msg: GuideSubmissionInput) {
  const stepEntries = msg.steps.map((step) => {
    const stepItemEntries = step.itemResponses.map((question) => {
      const submissionItemInfo: SubmissionItemInfo = {
        type: question.type.toString(),
        value: question.selectedAnswerKeys || question.userInput || question.userDiscordInfo,
      };
      return [question.uuid, submissionItemInfo];
    });
    const questionSubmissionsMap: UserGuideQuestionSubmission = Object.fromEntries(stepItemEntries);

    return [step.uuid, questionSubmissionsMap];
  });
  return Object.fromEntries(stepEntries);
}

function validateGuideSubmission(guide: GuideModel, stepSubmissionsMap: UserGuideStepSubmission) {
  guide.steps.forEach((step) =>
    step.stepItems.forEach((item) => {
      const isRequiredUserInput = isUserInput(item) && (item as UserInput).required;
      if (isRequiredUserInput || isUserDiscordConnect(item)) {
        if (!stepSubmissionsMap?.[step.uuid]?.[item.uuid]?.value) {
          throw Error('Field is required');
        }
      }
    })
  );
}

function getGuideResult(guide: GuideModel, stepSubmissionsMap: UserGuideStepSubmission) {
  const initial: GuideSubmissionResult = {
    correctQuestions: [],
    wrongQuestions: [],
    allQuestions: [],
  };

  const guideResult = guide.steps.reduceRight<GuideSubmissionResult>((result, { uuid, stepItems }) => {
    const stepSubmission = stepSubmissionsMap[uuid];
    const stepResults: GuideSubmissionResult = {
      correctQuestions: [],
      wrongQuestions: [],
      allQuestions: [],
    };

    const questionsItems = (stepItems || []).filter((si) => isQuestion(si));
    for (const questionItem of questionsItems) {
      if (isQuestion(questionItem)) {
        const question = questionItem as GuideQuestion;
        const answers = (stepSubmission?.[question.uuid].value as string[]) ?? [];
        // We do the intersection to make sure there are no obsolete answer keys. There was a bug which didn't delete the obsolete answer keys
        const answerKeys = intersection(
          question.answerKeys,
          question.choices.map((choice) => choice.key)
        );
        const isCorrect = isEqual(answers.sort(), answerKeys.sort());
        if (isCorrect) {
          stepResults.correctQuestions.push(question.uuid);
        } else {
          stepResults.wrongQuestions.push(question.uuid);
        }

        stepResults.allQuestions.push(question.uuid);
      }
    }

    const mergedResult: GuideSubmissionResult = {
      correctQuestions: [...result.correctQuestions, ...stepResults.correctQuestions],
      wrongQuestions: [...result.wrongQuestions, ...stepResults.wrongQuestions],
      allQuestions: [...result.allQuestions, ...stepResults.allQuestions],
    };

    return mergedResult;
  }, initial);
  return guideResult;
}

async function doSubmitGuide(
  user: (JwtPayload & DoDaoJwtTokenPayload) | undefined,
  msg: GuideSubmissionInput,
  context: NextRequest
): Promise<GuideSubmissionGraphql> {
  const spaceId = msg.space;

  const stepSubmissionsMap: UserGuideStepSubmission = getGuideStepSubmissionMap(msg);

  const response = await axios.get(`${getBaseUrl()}/api/guide/${msg.guideId}`);

  const guide = response.data.guide;

  if (!guide) {
    throw new Error(`No guide found with uuid ${msg.guideUuid}`);
  }

  validateGuideSubmission(guide, stepSubmissionsMap);

  const guideResult = getGuideResult(guide, stepSubmissionsMap);

  const xForwardedFor = context.headers.get('x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : context.ip || context.headers.get('x-real-ip');

  const submission: GuideSubmission = await prisma.guideSubmission.create({
    data: {
      id: msg.uuid,
      createdBy: user?.accountId.toLowerCase() || 'anonymous',
      createdByUsername: user?.username || 'anonymous',
      guideId: guide.id,
      guideUuid: msg.guideUuid,
      result: guideResult,
      spaceId: spaceId,
      steps: msg.steps,
      createdAt: new Date().toISOString(),
      uuid: msg.uuid,
      ipAddress: ip,
      correctQuestionsCount: guideResult.correctQuestions.length,
    },
  });

  return { ...submission };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = searchParams.get('filters');
  const spaceId = searchParams.get('spaceId');
  const guideId = searchParams.get('guideId');
  if (!spaceId) return NextResponse.json({ status: 400, message: 'Space ID is required' });
  if (!guideId) return NextResponse.json({ status: 400, message: 'Guide UUID is required' });
  if (!filters) return NextResponse.json({ status: 400, message: 'Filters are required' });
  const { page, itemsPerPage, createdByUsername, createdAt, correctQuestionsCount } = JSON.parse(filters) || {};
  const submissions = await prisma.guideSubmission.findMany({
    skip: page * itemsPerPage,
    take: itemsPerPage && itemsPerPage < 200 ? itemsPerPage : 200,
    where: {
      guideId: guideId,
      spaceId: spaceId,
      createdByUsername: createdByUsername ? { contains: createdByUsername } : undefined,
      createdAt: createdAt
        ? {
            gte: createdAt.after ? createdAt.after : undefined,
            lte: createdAt.before ? createdAt.before : undefined,
          }
        : undefined,
      correctQuestionsCount: correctQuestionsCount ? { gte: correctQuestionsCount } : undefined,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return NextResponse.json({ status: 200, guideSubmissions: submissions });
}

export async function POST(req: NextRequest) {
  const guideInput = (await req.json()) as MutationSubmitGuideArgs;
  const space = await getSpaceById(guideInput.submissionInput.space);
  const decodedJWT = await getDecodedJwtFromContext(req);
  const user = decodedJWT?.accountId.toLowerCase();

  if (!user && space.authSettings.enableLogin && space.guideSettings.askForLoginToSubmit) {
    throw new Error('You must be logged in to submit a guide');
  }

  const submitGuide = await doSubmitGuide(decodedJWT!, guideInput.submissionInput, req);

  return NextResponse.json({ status: 200, submitGuide });
}
