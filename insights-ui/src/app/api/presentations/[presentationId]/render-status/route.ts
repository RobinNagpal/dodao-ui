import { NextRequest, NextResponse } from 'next/server';
import { getBucketName } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL || 'https://8tpy77esof.execute-api.us-east-1.amazonaws.com';

type Params = { params: Promise<{ presentationId: string }> };

/**
 * POST /api/presentations/[presentationId]/render-status
 * Check render status for a specific renderId
 */
async function postHandler(req: NextRequest, { params }: Params): Promise<any> {
  const { presentationId } = await params;
  const body = await req.json();
  const { renderId } = body;

  if (!renderId) {
    return NextResponse.json({ error: 'renderId is required' }, { status: 400 });
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
    return NextResponse.json({ error: result.error || 'Failed to get render status' }, { status: response.status });
  }

  return NextResponse.json({
    presentationId,
    ...result,
  });
}

export const POST = withErrorHandlingV2<any>(postHandler);
