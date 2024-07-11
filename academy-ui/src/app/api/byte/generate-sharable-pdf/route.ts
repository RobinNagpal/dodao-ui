import { MutationGenerateSharablePdfArgs } from '@/graphql/generated/generated-types';
import downloadImageToTempLocation from '@/app/api/helpers/share/downloadImageToTempLocation';
import { writeByteLinkedinContentToPdf } from '@/app/api/helpers/share/textOnImage';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { getAcademyObjectFromRedis } from '@/app/api/helpers/academy/readers/academyObjectReader';
import { uploadFileToS3 } from '@/app/api/helpers/s3/uploadFileToS3';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { slugify } from '@/app/api/helpers/space/slugify';
import { prisma } from '@/prisma';
import { Byte, Space } from '@prisma/client';
import os from 'os';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationGenerateSharablePdfArgs = await req.json();
  const spaceById: Space = await getSpaceById(args.spaceId);
  const jwt = await checkEditSpacePermission(spaceById, req);

  if (!spaceById.socialSettings.linkedSharePdfBackgroundImage) {
    throw new Error('No background image set for this space');
  }
  const byte = (await getAcademyObjectFromRedis(args.spaceId, AcademyObjectTypes.bytes, args.byteId)) as Byte | undefined;

  if (!byte) {
    throw new Error('Byte not found');
  }

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

  return NextResponse.json({ status: 200, outputLocation: await uploadFileToS3(s3Key, 'application/pdf', tmpPdfFilePath) });
}
