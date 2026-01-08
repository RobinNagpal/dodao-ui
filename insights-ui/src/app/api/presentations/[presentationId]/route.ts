import { NextRequest } from 'next/server';
import { getPresentationStatus, getPresentationPreferences, getBucketName, deletePresentation, callRemotionLambda } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  PresentationDetailResponse,
  UpdatePresentationResponse,
  DeletePresentationResponse,
  SlidePreference,
  Slide,
} from '@/types/presentation/presentation-types';

interface UpdatePresentationRequestBody {
  voice?: string;
  slides: Slide[];
}

/**
 * GET /api/presentations/[presentationId] - Get presentation details and status
 */
async function getHandler(req: NextRequest, { params }: { params: Promise<{ presentationId: string }> }): Promise<PresentationDetailResponse> {
  const { presentationId } = await params;

  // Get status from our S3 utils
  const status = await getPresentationStatus(presentationId);
  const preferences = await getPresentationPreferences(presentationId);

  // Also get status from Remotion Lambda for more detailed render info
  try {
    const remotionStatus = await callRemotionLambda('/presentation-status', {
      presentationId: `presentations/${presentationId}`,
      outputBucket: getBucketName(),
    });

    // Merge remotion status into our status
    if (remotionStatus.slides) {
      for (const rs of remotionStatus.slides) {
        const localSlide = status.slides.find((s) => s.slideNumber === rs.slideNumber);
        if (localSlide) {
          localSlide.hasImage = localSlide.hasImage || rs.hasImage;
          localSlide.hasAudio = localSlide.hasAudio || rs.hasAudio;
          localSlide.hasVideo = localSlide.hasVideo || rs.hasVideo;
          localSlide.imageStatus = rs.imageStatus || localSlide.imageStatus;
          localSlide.imageUrl = rs.imageUrl || localSlide.imageUrl;
          localSlide.imageRenderId = rs.imageRenderId || localSlide.imageRenderId;
          localSlide.videoStatus = rs.videoStatus || localSlide.videoStatus;
          localSlide.videoUrl = rs.videoUrl || localSlide.videoUrl;
          localSlide.videoRenderId = rs.videoRenderId || localSlide.videoRenderId;
        }
      }
    }
  } catch (error) {
    console.error('Failed to get remotion status:', error);
  }

  return {
    presentationId,
    status: {
      presentationId,
      ...status,
    },
    preferences,
  };
}

/**
 * PUT /api/presentations/[presentationId] - Update presentation preferences
 */
async function putHandler(req: NextRequest, { params }: { params: Promise<{ presentationId: string }> }): Promise<UpdatePresentationResponse> {
  const { presentationId } = await params;
  const body: UpdatePresentationRequestBody = await req.json();
  const { voice, slides } = body;

  if (!slides || !Array.isArray(slides)) {
    throw new Error('slides array is required');
  }

  const outputBucket = getBucketName();

  // Format slides with slide numbers
  const formattedSlides: SlidePreference[] = slides.map((slide: Slide, index: number) => ({
    slideNumber: String(index + 1).padStart(2, '0'),
    slide,
  }));

  // Call Remotion Lambda to save preferences
  const result = await callRemotionLambda('/save-preferences', {
    presentationId: `presentations/${presentationId}`,
    outputBucket,
    voice: voice || 'en-US-JennyNeural',
    slides: formattedSlides,
  });

  return {
    success: true,
    presentationId,
    ...result,
  };
}

/**
 * DELETE /api/presentations/[presentationId] - Delete entire presentation
 */
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ presentationId: string }> }): Promise<DeletePresentationResponse> {
  const { presentationId } = await params;

  const deleted = await deletePresentation(presentationId);

  if (!deleted) {
    throw new Error('Failed to delete presentation');
  }

  return {
    success: true,
    presentationId,
  };
}

export const GET = withErrorHandlingV2<PresentationDetailResponse>(getHandler);
export const PUT = withErrorHandlingV2<UpdatePresentationResponse>(putHandler);
export const DELETE = withErrorHandlingV2<DeletePresentationResponse>(deleteHandler);
