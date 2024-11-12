import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { CreateSignedUrlForHtmlCaptureRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import { NextRequest, NextResponse } from 'next/server';

const createKeyFunction = (args: { spaceId: string; demoId: string; name: string }) => {
  const { spaceId, demoId, name } = args;
  return () => `zipped-html-captures/${spaceId}/${demoId}/${name}`;
};

async function postHandler(req: NextRequest, { params }: { params: Promise<{ demoId: string; spaceId: string }> }): Promise<NextResponse<SingedUrlResponse>> {
  const { demoId, spaceId } = await params;
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(spaceId);

  if (apiKey) {
    await validateApiKey(apiKey, spaceId);
  } else {
    await checkEditSpacePermission(spaceById, req);
  }

  const args: CreateSignedUrlForHtmlCaptureRequest = await req.json();

  console.log('got request to create signed url for html capture', args);

  const url = await presignedUrlCreator.createSignedUrl(args.contentType, createKeyFunction({ spaceId, demoId, name: args.name }));

  return NextResponse.json({ url }, { status: 200 });
}

export const POST = withErrorHandlingV1<SingedUrlResponse>(postHandler);
