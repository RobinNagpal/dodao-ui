import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import { CreateClickableDemoHtmlCaptureRequest } from '@/types/request/ClickableDemoHtmlCaptureRequests';
import { NextRequest, NextResponse } from 'next/server';
import { createNewEntityId } from '@dodao/web-core/utils/space/createNewEntityId';

async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ClickableDemoHtmlCaptureDto>> {
  const args: CreateClickableDemoHtmlCaptureRequest = await req.json();
  const { spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');

  if (apiKey) {
    await validateApiKey(apiKey, spaceId);
  }
  // Create a new ClickableDemoHtmlCapture record in the database
  const capture = await prisma.clickableDemoHtmlCaptures.create({
    data: {
      id: createNewEntityId(args.input.fileName, spaceId),
      clickableDemoId: args.input.clickableDemoId,
      fileName: args.input.fileName,
      fileUrl: args.input.fileUrl,
      fileImageUrl: args.input.fileImageUrl,
      createdAt: new Date(),
    },
  });
  return NextResponse.json(capture, { status: 200 });
}

export const POST = withErrorHandlingV1<ClickableDemoHtmlCaptureDto>(postHandler);
