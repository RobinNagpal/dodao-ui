import { NextRequest } from 'next/server';
import { getBucketName } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { RenderStatusResponse } from '@/types/presentation/presentation-types';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL;

type Params = { params: Promise<{ presentationId: string }> };

/**
 * POST /api/presentations/[presentationId]/render-status
 * Check render status for a specific renderId
 */
async function postHandler(req: NextRequest, { params }: Params): Promise<RenderStatusResponse> {
  if (!REMOTION_LAMBDA_URL) {
    throw new Error('REMOTION_LAMBDA_URL environment variable is not configured');
  }

  const { presentationId } = await params;
  const body = await req.json();
  const { renderId } = body;

  if (!renderId) {
    throw new Error('renderId is required');
  }

  const response = await fetch(`${REMOTION_LAMBDA_URL}/render-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      renderId,
      bucketName: getBucketName(),
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get render status');
  }

  return {
    presentationId,
    ...result,
  };
}

export const POST = withErrorHandlingV2<RenderStatusResponse>(postHandler);
