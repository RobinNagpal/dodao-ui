import { MutationUpsertByteRatingArgs } from '@/graphql/generated/generated-types';
import { getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { prisma } from '@/prisma';
import { ByteRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationUpsertByteRatingArgs = await req.json();
  const decodedJWT = await getDecodedJwtFromContext(req);
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.ip || req.headers.get('x-real-ip');
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
  return NextResponse.json({ status: 200, byteRating });
}
