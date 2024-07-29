import { MutationDeleteGitCourseSubmissionArgs } from '@/graphql/generated/generated-types';
import { verifyJwtForRequest } from '@/app/api/helpers/permissions/verifyJwtForRequest';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationDeleteGitCourseSubmissionArgs = await req.json();
  const { decodedJwt } = await verifyJwtForRequest(req, args.spaceId);

  await prisma.courseTopicSubmission.deleteMany({
    where: {
      createdBy: decodedJwt.username,
      courseKey: args.courseKey,
      spaceId: args.spaceId,
    },
  });

  await prisma.courseSubmission.deleteMany({
    where: {
      createdBy: decodedJwt.username,
      courseKey: args.courseKey,
      spaceId: args.spaceId,
    },
  });

  return NextResponse.json({ status: 200, body: true });
}
