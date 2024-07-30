import { MutationCreateSignedUrlArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationCreateSignedUrlArgs = await req.json();
  try {
    const spaceById = await getSpaceById(args.spaceId);

    // Check if the space is not TIDBITS_HUB as it is used to add logos for new tidbit sites
    if (spaceById.id !== 'tidbitshub') {
      await checkEditSpacePermission(spaceById, req);
    }

    return NextResponse.json({ status: 200, url: await presignedUrlCreator.createSignedUrl(spaceById.id, args.input) });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in createSignedUrlMutation', {}, e as any, null, null);
    throw e;
  }
}
