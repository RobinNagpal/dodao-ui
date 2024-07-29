import { MutationRefreshGitCoursesArgs } from '@/graphql/generated/generated-types';
import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationRefreshGitCoursesArgs = await req.json();
  try {
    const { space } = await verifySpaceEditPermissions(req, args.spaceId);

    // Need to correct this logic
    // await pullAllCoursesForSpace(space);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
