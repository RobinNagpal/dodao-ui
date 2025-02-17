import { ByteModel } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { MutationSubmitByteArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { postByteSubmission } from '@/app/api/helpers/discord/webhookMessage';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { submissionInput }: MutationSubmitByteArgs = await req.json();
  const space = await getSpaceById(submissionInput.space);
  const decodedJWT = await getDecodedJwtFromContext(req);
  const user = decodedJWT?.username.toLowerCase();

  const byte: ByteModel | undefined = await getByte(space.id, submissionInput.byteId);

  if (!byte) {
    throw new Error(`No byte found with uuid ${submissionInput.byteId}`);
  }

  const xForwardedFor = req.headers.get('x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.headers.get('x-real-ip');

  const submission = await prisma.byteSubmission.create({
    data: {
      id: submissionInput.uuid,
      createdBy: user || 'anonymous',
      byteId: byte.id,
      spaceId: space.id,
      ipAddress: ip,
      created: new Date().toISOString(),
    },
  });

  if (process.env.ALL_GUIDE_SUBMISSIONS_WEBHOOK) {
    postByteSubmission(process.env.ALL_GUIDE_SUBMISSIONS_WEBHOOK, byte, submissionInput);
  }

  return NextResponse.json({ submitByte: submission }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
