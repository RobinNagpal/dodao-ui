import { NextRequest, NextResponse } from 'next/server';
import { listPresentations, savePresentationPreferences, getBucketName } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PresentationSummary, SavePreferencesRequest, DEFAULT_VOICE } from '@/types/presentation/presentation-types';

const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL || 'https://8tpy77esof.execute-api.us-east-1.amazonaws.com';

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
async function postHandler(req: NextRequest): Promise<any> {
  const body = await req.json();
  const { mode, presentationId, voice = DEFAULT_VOICE } = body;

  if (!presentationId) {
    return NextResponse.json({ error: 'presentationId is required' }, { status: 400 });
  }

  const outputBucket = getBucketName();

  if (mode === 'json') {
    // Direct JSON mode - save preferences
    const { slides } = body;
    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json({ error: 'slides array is required' }, { status: 400 });
    }

    // Format slides with slide numbers
    const formattedSlides = slides.map((slide: any, index: number) => ({
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
      return NextResponse.json({ error: result.error || 'Failed to save preferences' }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      presentationId,
      mode: 'json',
      slideCount: formattedSlides.length,
      ...result,
    });
  } else if (mode === 'prompt') {
    // Prompt mode - generate from AI
    const { prompt, numberOfSlides = 5, additionalInstructions } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required for prompt mode' }, { status: 400 });
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
      return NextResponse.json({ error: result.error || 'Failed to generate from prompt' }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      presentationId,
      mode: 'prompt',
      ...result,
    });
  } else {
    return NextResponse.json({ error: 'Invalid mode. Use "json" or "prompt"' }, { status: 400 });
  }
}

export const GET = withErrorHandlingV2<{ presentations: PresentationSummary[] }>(getHandler);
export const POST = withErrorHandlingV2<any>(postHandler);

