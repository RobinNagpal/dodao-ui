import { NextRequest } from 'next/server';
import { addSlideToPresentation } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AddSlideResponse } from '@/types/presentation/presentation-types';

type Params = { params: Promise<{ presentationId: string }> };

/**
 * POST /api/presentations/[presentationId]/slides
 * Add a new slide to the presentation
 */
async function postHandler(req: NextRequest, { params }: Params): Promise<AddSlideResponse> {
  const { presentationId } = await params;
  const body = await req.json();
  const { slide } = body;

  console.log('Add slide request:', presentationId, slide);

  if (!slide) {
    throw new Error('slide object is required');
  }

  if (!slide.type || !slide.title || !slide.narration) {
    throw new Error('slide must have type, title, and narration');
  }

  const result = await addSlideToPresentation(presentationId, slide);

  console.log('Add slide result:', result);

  if (!result.success) {
    throw new Error(result.error || 'Failed to add slide');
  }

  return {
    success: true,
    presentationId,
    slideNumber: result.slideNumber!,
    message: 'Slide added successfully',
  };
}

export const POST = withErrorHandlingV2<AddSlideResponse>(postHandler);
