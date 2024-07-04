import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { PredefinedSpaces } from '@/app/api/helpers/constants/constants';
import { presignedUrlCreator } from '@/app/api/helpers/s3/getPresignedUrl';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { spaceId, input } = await req.json();
    const spaceById = await getSpaceById(spaceId);

    // Check if the space is not TIDBITS_HUB as it is used to add logos for new tidbit sites
    if (spaceById.id !== PredefinedSpaces.TIDBITS_HUB) {
      await checkEditSpacePermission(spaceById, req);
    }

    return NextResponse.json({ status: 200, body: await presignedUrlCreator.createSignedUrl(spaceById.id, input) });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in createSignedUrlMutation', {}, e as any, null, null);
    throw e;
  }
}
