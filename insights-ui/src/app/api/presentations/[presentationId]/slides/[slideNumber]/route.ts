import { NextRequest } from 'next/server';
import { getBucketName, getPresentationsPrefix, getJsonFromS3, putJsonToS3, deleteSlideFromPresentation, uploadFileToS3 } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { GenerateArtifactResponse, DeleteSlideResponse } from '@/types/presentation/presentation-types';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL;

type SlideParams = { params: Promise<{ presentationId: string; slideNumber: string }> };

/**
 * POST /api/presentations/[presentationId]/slides/[slideNumber]
 * Generate artifacts for a slide
 * Query params:
 * - action: 'audio' | 'image' | 'video' | 'all'
 */
async function postHandler(req: NextRequest, { params }: SlideParams): Promise<GenerateArtifactResponse> {
  if (!REMOTION_LAMBDA_URL) {
    throw new Error('REMOTION_LAMBDA_URL environment variable is not configured');
  }

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
    throw new Error(result.error || `Failed to generate ${action}`);
  }

  // Store audio URL in render metadata if it was returned
  // Use direct S3 URL (not presigned) so it doesn't expire
  if (result.audioUrl && (action === 'audio' || action === 'all')) {
    try {
      const metadataKey = `${getPresentationsPrefix()}/${presentationId}/output/${slideNumber}-slide/render-metadata.json`;

      // Get existing metadata
      const existingMetadata = await getJsonFromS3(metadataKey).catch(() => ({}));

      // Use direct S3 URL for storage - audioUrl from Lambda is now a direct URL
      // that won't expire (audioPresignedUrl is for immediate Remotion use only)
      const updatedMetadata = {
        ...(existingMetadata && typeof existingMetadata === 'object' ? existingMetadata : {}),
        audioUrl: result.audioUrl, // Direct S3 URL
      };

      await putJsonToS3(metadataKey, updatedMetadata);
    } catch (error) {
      console.error('Failed to store audio URL in metadata:', error);
      // Don't fail the request if metadata update fails
    }
  }

  return {
    success: true,
    action,
    presentationId,
    slideNumber,
    ...(result && typeof result === 'object' ? result : {}),
  };
}

/**
 * DELETE /api/presentations/[presentationId]/slides/[slideNumber]
 * Delete a slide from the presentation
 */
async function deleteHandler(req: NextRequest, { params }: SlideParams): Promise<DeleteSlideResponse> {
  const { presentationId, slideNumber } = await params;

  console.log('Deleting slide:', presentationId, slideNumber);

  const result = await deleteSlideFromPresentation(presentationId, slideNumber);

  console.log('Delete result:', result);

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete slide');
  }

  return {
    success: true,
    presentationId,
    slideNumber,
    message: 'Slide deleted successfully',
  };
}

export const POST = withErrorHandlingV2<GenerateArtifactResponse>(postHandler);
export const DELETE = withErrorHandlingV2<DeleteSlideResponse>(deleteHandler);
