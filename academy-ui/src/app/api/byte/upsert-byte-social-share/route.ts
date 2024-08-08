import { MutationUpsertByteSocialShareArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { ByteSocialShare } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';

async function postHandler(req: NextRequest) {
  const { spaceId, input }: MutationUpsertByteSocialShareArgs = await req.json();
  const spaceById = await getSpaceById(spaceId);
  const decodedJwt = await checkEditSpacePermission(spaceById, req);

  const savedObject: ByteSocialShare = await prisma.byteSocialShare.upsert({
    create: {
      uuid: v4(),
      byteId: input.byteId,
      spaceId: spaceId,
      linkedinPdfContent: input.linkedinPdfContent || undefined,
      linkedInImages: input.linkedInImages || undefined,
      linkedInPdf: input.linkedInPdf || undefined,
      twitterImage: input.twitterImage || undefined,
      updatedBy: decodedJwt?.userId || undefined,
      updatedAt: new Date(),
      createdAt: new Date(),
      createdBy: decodedJwt?.userId || undefined,
    },
    update: {
      linkedinPdfContent: input.linkedinPdfContent || undefined,
      linkedInImages: input.linkedInImages || undefined,
      linkedInPdf: input.linkedInPdf || undefined,
      twitterImage: input.twitterImage || undefined,
      updatedAt: new Date(),
      updatedBy: decodedJwt?.userId || undefined,
    },
    where: {
      byteId_spaceId: {
        byteId: input.byteId,
        spaceId: spaceId,
      },
    },
  });

  return NextResponse.json({ status: 200, byteSocialShare: savedObject });
}

export const POST = withErrorHandling(postHandler);
