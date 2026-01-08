import { NextRequest } from 'next/server';
import { getBucketName, callRemotionLambda } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { RenderStatusResponse } from '@/types/presentation/presentation-types';

type Params = { params: Promise<{ presentationId: string }> };

/**
 * POST /api/presentations/[presentationId]/render-status
 * Check render status for a specific renderId
 */
async function postHandler(req: NextRequest, { params }: Params): Promise<RenderStatusResponse> {
  const { presentationId } = await params;
  const body = await req.json();
  const { renderId } = body;

  if (!renderId) {
    throw new Error('renderId is required');
  }

  const result = await callRemotionLambda('/render-status', {
    renderId,
    bucketName: getBucketName(),
  });

  return {
    presentationId,
    ...result,
  };
}

export const POST = withErrorHandlingV2<RenderStatusResponse>(postHandler);
