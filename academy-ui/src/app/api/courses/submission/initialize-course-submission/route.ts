import { prisma } from '@/prisma';
import { MutationInitializeGitCourseSubmissionArgs } from '@/graphql/generated/generated-types';
import { verifyJwtForRequest } from '@/app/api/helpers/permissions/verifyJwtForRequest';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { v4 as uuid } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  try {
    const args: MutationInitializeGitCourseSubmissionArgs = await req.json();
    const spaceId = args.spaceId;
    const courseKey = args.courseKey;

    const { space, decodedJwt } = await verifyJwtForRequest(req, args.spaceId);

    const existingCourseSubmission = await prisma.courseSubmission.findFirst({
      where: {
        spaceId: spaceId,
        courseKey: courseKey,
        createdBy: decodedJwt.username,
      },
    });

    if (existingCourseSubmission) {
      throw new Error(`There is already an existing course submission: ${spaceId} - ${courseKey} - ${decodedJwt.username}`);
    }

    const topicSubmissions = await prisma.courseTopicSubmission.findMany({
      where: {
        spaceId: spaceId,
        courseKey: courseKey,
        createdBy: decodedJwt.username,
      },
    });

    if (topicSubmissions.length) {
      throw new Error(
        `There are already existing course topic submissions: ${spaceId} - ${courseKey} - ${decodedJwt.username} - ${JSON.stringify(
          topicSubmissions.map((ts) => ({ uuid: ts.uuid, topicKey: ts.topicKey }))
        )}`
      );
    }

    const courseSubmissionModel = await prisma.courseSubmission.create({
      data: {
        uuid: uuid().toString(),
        spaceId: spaceId,
        courseKey: courseKey,
        createdBy: decodedJwt.username,
        status: 'Initialized',
        isLatestSubmission: true,
      },
    });

    return NextResponse.json({ status: 200, body: { ...courseSubmissionModel, topicSubmissions: [] } });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}

export const POST = withErrorHandling(postHandler);
