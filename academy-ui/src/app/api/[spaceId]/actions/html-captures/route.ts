import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { NextRequest, NextResponse } from 'next/server';
import { CreateClickableDemoHtmlCaptureRequest } from '@/types/request/ClickableDemoHtmlCaptureRequests';
import { CreateClickableDemoHtmlCaptureResponse } from '@/types/response/ClickableDemoHtmlCaptureResponses';
import { ErrorResponse } from '@/types/response/ErrorResponse';

async function postHandler(
  req: NextRequest,
  { params }: { params: { spaceId: string } }
): Promise<NextResponse<CreateClickableDemoHtmlCaptureResponse | ErrorResponse>> {
  console.log('params', params);
  const args: CreateClickableDemoHtmlCaptureRequest = await req.json();
  const { spaceId } = params;
  const apiKey = req.headers.get('X-API-KEY');
  try {
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
  } catch (error) {
    await logError((error as any)?.response?.data || 'Error in createHtmlCapture', {}, error as any, null, null);
    throw new Error(`Failed to create ClickableDemoHtmlCapture: ${(error as Error).message}`);
  }
}

export const POST = withErrorHandling(postHandler);
