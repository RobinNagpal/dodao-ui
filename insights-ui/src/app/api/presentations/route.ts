import { NextRequest } from 'next/server';
import { listPresentations, getBucketName } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  PresentationSummary,
  DEFAULT_VOICE,
  PresentationsListResponse,
  CreatePresentationResponse,
  Slide,
  SlidePreference,
} from '@/types/presentation/presentation-types';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL;

/**
 * GET /api/presentations - List all presentations
 */
async function getHandler(): Promise<{ presentations: PresentationSummary[] }> {
  const presentations = await listPresentations();
  return { presentations };
}

/**
 * POST /api/presentations - Create a new presentation
 * Supports two modes:
 * 1. JSON mode: { mode: 'json', presentationId, voice?, slides }
 * 2. Prompt mode: { mode: 'prompt', presentationId, prompt, numberOfSlides, additionalInstructions?, voice? }
 */
async function postHandler(req: NextRequest): Promise<CreatePresentationResponse> {
  if (!REMOTION_LAMBDA_URL) {
    throw new Error('REMOTION_LAMBDA_URL environment variable is not configured');
  }

  const body = await req.json();
  const { mode, presentationId, voice = DEFAULT_VOICE } = body;

  if (!presentationId) {
    throw new Error('presentationId is required');
  }

  const outputBucket = getBucketName();

  if (mode === 'json') {
    // Direct JSON mode - save preferences
    const { slides } = body;
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      throw new Error('slides array is required');
    }

    // Format slides with slide numbers
    const formattedSlides: SlidePreference[] = slides.map((slide: Slide, index: number) => ({
      slideNumber: String(index + 1).padStart(2, '0'),
      slide: {
        ...slide,
        id: slide.id || `slide-${index + 1}`,
      },
    }));

    // Call Remotion Lambda to save preferences
    const response = await fetch(`${REMOTION_LAMBDA_URL}/save-preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presentationId: `presentations/${presentationId}`,
        outputBucket,
        voice,
        slides: formattedSlides,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save preferences');
    }

    return {
      success: true,
      presentationId,
      mode: 'json',
      slideCount: formattedSlides.length,
      ...result,
    };
  } else if (mode === 'prompt') {
    // Prompt mode - generate from AI
    const { prompt, numberOfSlides = 5, additionalInstructions } = body;

    if (!prompt) {
      throw new Error('prompt is required for prompt mode');
    }

    // Call Remotion Lambda to generate from prompt
    const response = await fetch(`${REMOTION_LAMBDA_URL}/generate-from-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presentationId: `presentations/${presentationId}`,
        prompt,
        numberOfSlides,
        additionalInstructions,
        outputBucket,
        voice,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate from prompt');
    }

    return {
      success: true,
      presentationId,
      mode: 'prompt',
      ...result,
    };
  } else {
    throw new Error('Invalid mode. Use "json" or "prompt"');
  }
}

export const GET = withErrorHandlingV2<PresentationsListResponse>(getHandler);
export const POST = withErrorHandlingV2<CreatePresentationResponse>(postHandler);
