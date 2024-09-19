import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { MutationCreateSignedUrlArgs } from '@/graphql/generated/generated-types';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationCreateSignedUrlArgs = await req.json();
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(args.spaceId);

  try {
    if (apiKey) {
      await validateApiKey(apiKey, args.spaceId);
    } else {
      await checkEditSpacePermission(spaceById, req);
    }
    const url = await presignedUrlCreator.createSignedUrl(spaceById.id, args.input);
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    await logError((error as any)?.response?.data || 'Error in createSignedUrls', {}, error as any, null, null);
    throw error;
  }
}

export const POST = withErrorHandling(postHandler);
