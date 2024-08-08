import { MutationUpsertGuideRatingArgs } from '@/graphql/generated/generated-types';
import { getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { prisma } from '@/prisma';
import { GuideRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const decodedJWT = await getDecodedJwtFromContext(req);
  const args = (await req.json()) as MutationUpsertGuideRatingArgs;

  const xForwardedFor = req.headers.get('x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0] : req.ip || req.headers.get('x-real-ip');

  const guideRating: GuideRating = await prisma.guideRating.upsert({
    where: {
      ratingUuid: args.upsertGuideRatingInput.ratingUuid,
    },
    create: {
      ratingUuid: args.upsertGuideRatingInput.ratingUuid,
      startRating: args.upsertGuideRatingInput.startRating,
      endRating: args.upsertGuideRatingInput.endRating,
      positiveFeedback: args.upsertGuideRatingInput.positiveFeedback || undefined,
      negativeFeedback: args.upsertGuideRatingInput.negativeFeedback || undefined,
      guideUuid: args.upsertGuideRatingInput.guideUuid,
      spaceId: args.upsertGuideRatingInput.spaceId,
      ipAddress: ip,
      skipEndRating: args.upsertGuideRatingInput.skipEndRating,
      skipStartRating: args.upsertGuideRatingInput.skipStartRating,
      username: decodedJWT?.username,
      suggestion: args.upsertGuideRatingInput.suggestion,
    },
    update: {
      startRating: args.upsertGuideRatingInput.startRating,
      endRating: args.upsertGuideRatingInput.endRating,
      positiveFeedback: args.upsertGuideRatingInput.positiveFeedback || undefined,
      negativeFeedback: args.upsertGuideRatingInput.negativeFeedback || undefined,
      guideUuid: args.upsertGuideRatingInput.guideUuid,
      ipAddress: ip,
      skipEndRating: args.upsertGuideRatingInput.skipEndRating,
      skipStartRating: args.upsertGuideRatingInput.skipStartRating,
      username: decodedJWT?.username,
    },
  });
  return NextResponse.json({ guideRating }, { status: 200 });
}
