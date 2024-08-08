import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { initPineconeClient } from '@/app/api/helpers/vectorIndexers/pineconeHelper';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
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

  return NextResponse.json({ success: true }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
