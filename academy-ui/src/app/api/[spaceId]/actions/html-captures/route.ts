import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { CreateClickableDemoHtmlCaptureRequest } from '@/types/request/ClickableDemoHtmlCaptureRequests';
import { CreateClickableDemoHtmlCaptureResponse } from '@/types/response/ClickableDemoHtmlCaptureResponses';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<CreateClickableDemoHtmlCaptureResponse>> {
  const args: CreateClickableDemoHtmlCaptureRequest = await req.json();
  const { spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');

  if (apiKey) {
    await validateApiKey(apiKey, spaceId!);
  }
  // Create a new ClickableDemoHtmlCapture record in the database
  const capture = await prisma.clickableDemoHtmlCaptures.create({
    data: {
      id: slugify(args.input.fileName) + '-' + uuidv4().toString().substring(0, 4),
      clickableDemoId: args.input.clickableDemoId,
      fileName: args.input.fileName,
      fileUrl: args.input.fileUrl,
      fileImageUrl: args.input.fileImageUrl,
      createdAt: new Date(),
    },
  });
  return NextResponse.json({ capture }, { status: 200 });
}

export const POST = withErrorHandlingV1<CreateClickableDemoHtmlCaptureResponse>(postHandler);
