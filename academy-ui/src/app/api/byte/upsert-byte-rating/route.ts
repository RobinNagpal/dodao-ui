import { MutationUpsertByteRatingArgs } from '@/graphql/generated/generated-types';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { ByteRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationUpsertByteRatingArgs = await req.json();
  const decodedJWT = await getDecodedJwtFromContext(req);
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.headers.get('x-real-ip');
  const byteRating: ByteRating = await prisma.byteRating.upsert({
    where: {
      ratingUuid: args.upsertByteRatingInput.ratingUuid,
    },
    create: {
      ratingUuid: args.upsertByteRatingInput.ratingUuid,
      rating: args.upsertByteRatingInput.rating,
      positiveFeedback: args.upsertByteRatingInput.positiveFeedback || undefined,
      negativeFeedback: args.upsertByteRatingInput.negativeFeedback || undefined,
      byteId: args.upsertByteRatingInput.byteId,
      spaceId: args.upsertByteRatingInput.spaceId,
      ipAddress: ip,
      skipRating: args.upsertByteRatingInput.skipRating,
      username: decodedJWT?.username,
      suggestion: args.upsertByteRatingInput.suggestion,
    },
    update: {
      rating: args.upsertByteRatingInput.rating,
      positiveFeedback: args.upsertByteRatingInput.positiveFeedback || undefined,
      negativeFeedback: args.upsertByteRatingInput.negativeFeedback || undefined,
      byteId: args.upsertByteRatingInput.byteId,
      ipAddress: ip,
      skipRating: args.upsertByteRatingInput.skipRating,
      username: decodedJWT?.username,
    },
  });
  return NextResponse.json({ byteRating }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
