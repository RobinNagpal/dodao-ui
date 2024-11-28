import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import { CreateClickableDemoHtmlCaptureRequest } from '@/types/request/ClickableDemoHtmlCaptureRequests';
import { NextRequest, NextResponse } from 'next/server';
import { createNewEntityId } from '@dodao/web-core/utils/space/createNewEntityId';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<ClickableDemoHtmlCaptureDto>> {
  const args: CreateClickableDemoHtmlCaptureRequest = await req.json();
  const { spaceId } = await params;
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
      archive: false,
    },
  });
  return NextResponse.json(capture, { status: 200 });
}

async function getHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ClickableDemoHtmlCaptureDto[]>> {
  const { spaceId } = params;
  const searchParams = req.nextUrl.searchParams;
  const clickableDemoId = searchParams.get('clickableDemoId');
  // Throw an error if clickableDemoId is not found
  if (!clickableDemoId) {
    throw new Error('clickableDemoId is required but was not provided');
  }
  const apiKey = req.headers.get('X-API-KEY');
  if (apiKey) {
    await validateApiKey(apiKey, spaceId);
  }

  // Fetch the ClickableDemoHtmlCapture record based on demoId
  const capture = await prisma.clickableDemoHtmlCaptures.findMany({
    where: {
      clickableDemoId: clickableDemoId,
      archive: false,
    },
  });
  return NextResponse.json(capture as ClickableDemoHtmlCaptureDto[], { status: 200 });
}

export const GET = withErrorHandlingV1<ClickableDemoHtmlCaptureDto[]>(getHandler);

export const POST = withErrorHandlingV1<ClickableDemoHtmlCaptureDto>(postHandler);
