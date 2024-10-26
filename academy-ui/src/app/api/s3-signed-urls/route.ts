import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { CreateSignedUrlInput } from '@/graphql/generated/generated-types';
import { CreateSignedUrlRequest } from '@/types/request/SignedUrl';
import { SingedUrlResponse } from '@/types/response/SignedUrl';
import { NextRequest, NextResponse } from 'next/server';

const createKeyFunction = (spaceId: string, args: CreateSignedUrlInput) => {
  const { imageType, objectId, name } = args;
  return () => `academy/${spaceId}/${imageType}/${objectId}/${Date.now()}_${name}`;
};

async function postHandler(req: NextRequest): Promise<NextResponse<SingedUrlResponse>> {
  const args: CreateSignedUrlRequest = await req.json();
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(args.spaceId);

  if (apiKey) {
    await validateApiKey(apiKey, args.spaceId);
  } else if (spaceById.id !== 'tidbitshub') {
    // we check because on tidbits hub, a person can be setting new site and adding logo
    await checkEditSpacePermission(spaceById, req);
  }
  const url = await presignedUrlCreator.createSignedUrl(args.input.contentType, createKeyFunction(args.spaceId, args.input));
  return NextResponse.json({ url }, { status: 200 });
}

export const POST = withErrorHandlingV1<SingedUrlResponse>(postHandler);
