import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { uploadFileToS3 } from '@/app/api/helpers/s3/uploadFileToS3';
import downloadImageToTempLocation from '@/app/api/helpers/share/downloadImageToTempLocation';
import { writeByteLinkedinContentToPdf } from '@/app/api/helpers/share/textOnImage';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { slugify } from '@/app/api/helpers/space/slugify';
import { MutationGenerateSharablePdfArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';

async function postHandler(req: NextRequest) {
  const args: MutationGenerateSharablePdfArgs = await req.json();
  const spaceById: Space = await getSpaceById(args.spaceId);
  const jwt = await checkEditSpacePermission(spaceById, req);

  if (!spaceById.socialSettings.linkedSharePdfBackgroundImage) {
    throw new Error('No background image set for this space');
  }

  const byte = await prisma.byte.findUniqueOrThrow({
    where: {
      id: args.byteId,
    },
  });

  const byteSocialshare = await prisma.byteSocialShare.findUniqueOrThrow({
    where: {
      byteId_spaceId: {
        byteId: args.byteId,
        spaceId: args.spaceId,
      },
    },
  });

  const backgroundImageUrl = await downloadImageToTempLocation(spaceById.socialSettings.linkedSharePdfBackgroundImage);

  const filename = 'byte-' + slugify(byte.name) + '.pdf';
  const tmpPdfFilePath = path.join(os.tmpdir(), filename);

  await writeByteLinkedinContentToPdf(backgroundImageUrl, byteSocialshare.linkedinPdfContent, tmpPdfFilePath);

  const s3Key = `academy/${spaceById.id}/Social/${AcademyObjectTypes.bytes}/${filename}`;

  return NextResponse.json({ outputLocation: await uploadFileToS3(s3Key, 'application/pdf', tmpPdfFilePath) }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
