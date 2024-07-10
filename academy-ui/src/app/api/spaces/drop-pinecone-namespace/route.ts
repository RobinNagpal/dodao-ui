import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { initPineconeClient } from '@/app/api/helpers/vectorIndexers/pineconeHelper';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaceId } = await req.json();
  const { space } = await verifySpaceEditPermissions(req, spaceId);

  await validateSuperAdmin(req);
  const index = await initPineconeClient();
  await index._delete({
    deleteRequest: {
      deleteAll: true,
      namespace: space.id,
    },
  });

  return NextResponse.json({ status: 200, success: true });
}
