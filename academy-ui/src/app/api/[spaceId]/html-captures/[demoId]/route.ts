import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: {spaceId:string, demoId: string } }): Promise<NextResponse<ClickableDemoHtmlCaptureDto[]>> {
  const { spaceId ,demoId } = params;
  const apiKey = req.headers.get('X-API-KEY');
    console.log(spaceId);
    console.log(demoId);
  // Validate API key if present
  if (apiKey) {
    await validateApiKey(apiKey, spaceId);
  }

  // Fetch the ClickableDemoHtmlCapture record based on demoId
  const capture = await prisma.clickableDemoHtmlCaptures.findMany({
    where: {
      clickableDemoId: demoId,
    },
  });
  console.log(capture);
  return NextResponse.json(capture as ClickableDemoHtmlCaptureDto[], { status: 200 });
}

export const GET = withErrorHandlingV1<ClickableDemoHtmlCaptureDto[]>(getHandler);
