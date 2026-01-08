import { NextRequest, NextResponse } from 'next/server';
import { addSlideToPresentation } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

type Params = { params: Promise<{ presentationId: string }> };

/**
 * POST /api/presentations/[presentationId]/slides
 * Add a new slide to the presentation
 */
async function postHandler(req: NextRequest, { params }: Params): Promise<any> {
  const { presentationId } = await params;
  const body = await req.json();
  const { slide } = body;

  console.log('Add slide request:', presentationId, slide);

  if (!slide) {
    return NextResponse.json({ error: 'slide object is required' }, { status: 400 });
  }

  if (!slide.type || !slide.title || !slide.narration) {
    return NextResponse.json({ error: 'slide must have type, title, and narration' }, { status: 400 });
  }

  const result = await addSlideToPresentation(presentationId, slide);

  console.log('Add slide result:', result);

  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Failed to add slide' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    presentationId,
    slideNumber: result.slideNumber,
    message: 'Slide added successfully',
  });
}

export const POST = withErrorHandlingV2<any>(postHandler);
