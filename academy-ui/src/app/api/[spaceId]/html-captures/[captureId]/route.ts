import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { NextRequest, NextResponse } from 'next/server';

async function deleteHandler(
  req: NextRequest,
  { params }: { params: { spaceId: string; captureId: string } }
): Promise<NextResponse<ClickableDemoHtmlCaptureDto>> {

  await validateSuperAdmin(req);

  // Archive the ClickableDemoHtmlCapture record from the database
  const capture = await prisma.clickableDemoHtmlCaptures.update({
    where: {
      id: params.captureId,
    },
    data: {
      archive: true,
    },
  });
  return NextResponse.json(capture, { status: 200 });
}

export const DELETE = withErrorHandlingV1<ClickableDemoHtmlCaptureDto>(deleteHandler);
