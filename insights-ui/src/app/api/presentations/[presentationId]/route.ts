import { NextRequest, NextResponse } from 'next/server';
import { getPresentationStatus, getPresentationPreferences, getBucketName } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PresentationStatus, PresentationPreferences } from '@/types/presentation/presentation-types';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL || 'https://8tpy77esof.execute-api.us-east-1.amazonaws.com';

/**
 * GET /api/presentations/[presentationId] - Get presentation details and status
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
): Promise<{
  presentationId: string;
  status: PresentationStatus;
  preferences: PresentationPreferences | null;
}> {
  const { presentationId } = await params;

  // Get status from our S3 utils
  const status = await getPresentationStatus(presentationId);
  const preferences = await getPresentationPreferences(presentationId);

  // Also get status from Remotion Lambda for more detailed render info
  try {
    const response = await fetch(`${REMOTION_LAMBDA_URL}/presentation-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presentationId: `presentations/${presentationId}`,
        outputBucket: getBucketName(),
      }),
    });

    if (response.ok) {
      const remotionStatus = await response.json();
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
async function putHandler(
  req: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
): Promise<any> {
  const { presentationId } = await params;
  const body = await req.json();
  const { voice, slides } = body;

  if (!slides || !Array.isArray(slides)) {
    return NextResponse.json({ error: 'slides array is required' }, { status: 400 });
  }

  const outputBucket = getBucketName();

  // Format slides with slide numbers
  const formattedSlides = slides.map((slideData: any, index: number) => ({
    slideNumber: slideData.slideNumber || String(index + 1).padStart(2, '0'),
    slide: slideData.slide || slideData,
  }));

  // Call Remotion Lambda to save preferences
  const response = await fetch(`${REMOTION_LAMBDA_URL}/save-preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presentationId: `presentations/${presentationId}`,
      outputBucket,
      voice: voice || 'en-US-JennyNeural',
      slides: formattedSlides,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: result.error || 'Failed to update preferences' }, { status: response.status });
  }

  return NextResponse.json({
    success: true,
    presentationId,
    ...result,
  });
}

export const GET = withErrorHandlingV2<any>(getHandler);
export const PUT = withErrorHandlingV2<any>(putHandler);

