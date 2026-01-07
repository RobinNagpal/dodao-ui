import { NextRequest, NextResponse } from 'next/server';
import { getBucketName, getPresentationsPrefix, getJsonFromS3, putJsonToS3 } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL || 'https://8tpy77esof.execute-api.us-east-1.amazonaws.com';

type SlideParams = { params: Promise<{ presentationId: string; slideNumber: string }> };

/**
 * POST /api/presentations/[presentationId]/slides/[slideNumber]
 * Generate artifacts for a slide
 * Query params:
 * - action: 'audio' | 'image' | 'video' | 'all'
 */
async function postHandler(req: NextRequest, { params }: SlideParams): Promise<any> {
  const { presentationId, slideNumber } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'all';
  
  const body = await req.json().catch(() => ({}));
  const voice = body.voice || 'en-US-JennyNeural';
  const outputBucket = getBucketName();

  const basePayload = {
    presentationId: `presentations/${presentationId}`,
    slideNumber,
    outputBucket,
    voice,
  };

  let endpoint: string;
  switch (action) {
    case 'audio':
      endpoint = '/generate-slide-audio';
      break;
    case 'image':
      endpoint = '/generate-slide-image';
      break;
    case 'video':
      endpoint = '/generate-slide-video';
      break;
    case 'all':
    default:
      endpoint = '/generate-slide-all';
      break;
  }

  const response = await fetch(`${REMOTION_LAMBDA_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(basePayload),
  });

  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: result.error || `Failed to generate ${action}` },
      { status: response.status }
    );
  }

  // Store audio URL in render metadata if it was returned
  if (result.audioUrl && (action === 'audio' || action === 'all')) {
    try {
      const metadataKey = `${getPresentationsPrefix()}/${presentationId}/output/${slideNumber}-slide/render-metadata.json`;

      // Get existing metadata
      const existingMetadata = await getJsonFromS3(metadataKey).catch(() => ({}));

      // Update with audio URL
      const updatedMetadata = {
        ...existingMetadata,
        audioUrl: result.audioUrl,
      };

      await putJsonToS3(metadataKey, updatedMetadata);
    } catch (error) {
      console.error('Failed to store audio URL in metadata:', error);
      // Don't fail the request if metadata update fails
    }
  }

  return NextResponse.json({
    success: true,
    action,
    presentationId,
    slideNumber,
    ...result,
  });
}

export const POST = withErrorHandlingV2<any>(postHandler);

