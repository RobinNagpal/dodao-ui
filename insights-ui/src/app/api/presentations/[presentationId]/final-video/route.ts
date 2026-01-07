import { NextRequest, NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { getPresentationStatus, getBucketName, getPresentationsPrefix } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// FFmpeg Lambda configuration
const FFMPEG_LAMBDA_NAME = 'ffmpeg-video-merger';
const REGION = process.env.HASSAAN_AWS_REGION || 'us-east-1';

const lambdaClient = new LambdaClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.HASSAAN_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.HASSAAN_AWS_SECRET_ACCESS_KEY!,
  },
});

type Params = { params: Promise<{ presentationId: string }> };

/**
 * POST /api/presentations/[presentationId]/final-video
 * Generate final video by concatenating all slide videos using FFmpeg Lambda
 */
async function postHandler(req: NextRequest, { params }: Params): Promise<any> {
  const { presentationId } = await params;

  // Get presentation status to find all video URLs
  const status = await getPresentationStatus(presentationId);

  if (!status.hasPreferences) {
    return NextResponse.json({ error: 'Presentation not found' }, { status: 404 });
  }

  // Collect all video URLs that are completed
  const videoClips: { s3Url: string; s3Key: string }[] = [];
  const missingVideos: string[] = [];

  // Function to extract S3 key from video URL
  const extractS3Key = (videoUrl: string): string => {
    // Our video URLs are in format: https://s3.region.amazonaws.com/bucket/renders/renderId/presentation/path/video.mp4
    // We need to extract: renders/renderId/presentation/path/video.mp4
    const url = new URL(videoUrl);
    const pathParts = url.pathname.substring(1).split('/'); // Remove leading slash and split
    pathParts.shift(); // Remove bucket name (first part after domain)
    return pathParts.join('/');
  };

  for (const slide of status.slides) {
    if (slide.hasVideo && slide.videoUrl) {
      const s3Key = extractS3Key(slide.videoUrl);
      videoClips.push({ s3Url: slide.videoUrl, s3Key });
    } else {
      missingVideos.push(slide.slideNumber);
    }
  }

  if (videoClips.length === 0) {
    return NextResponse.json(
      { error: 'No videos found. Please generate slide videos first.' },
      { status: 400 }
    );
  }

  if (missingVideos.length > 0) {
    return NextResponse.json(
      {
        error: `Videos missing for slides: ${missingVideos.join(', ')}. Generate all slide videos first.`,
        missingSlides: missingVideos,
      },
      { status: 400 }
    );
  }

  // Prepare FFmpeg Lambda payload
  const outputKey = `${getPresentationsPrefix()}/${presentationId}/output/final-video.mp4`;
  const payload = {
    clips: videoClips,
    outputKey,
  };

  console.log('Invoking FFmpeg Lambda with payload:', JSON.stringify(payload, null, 2));

  try {
    // Invoke FFmpeg Lambda
    const command = new InvokeCommand({
      FunctionName: FFMPEG_LAMBDA_NAME,
      InvocationType: 'RequestResponse', // Synchronous invocation
      Payload: Buffer.from(JSON.stringify(payload)),
    });

    const response = await lambdaClient.send(command);

    // Parse response
    const responsePayload = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : null;

    if (response.FunctionError) {
      console.error('FFmpeg Lambda error:', responsePayload);
      return NextResponse.json(
        { error: responsePayload?.errorMessage || 'FFmpeg Lambda execution failed' },
        { status: 500 }
      );
    }

    // Parse the body from Lambda response
    let result;
    if (responsePayload?.body) {
      result = typeof responsePayload.body === 'string' 
        ? JSON.parse(responsePayload.body) 
        : responsePayload.body;
    } else {
      result = responsePayload;
    }

    if (!result?.success) {
      return NextResponse.json(
        { error: result?.error || 'Failed to merge videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      presentationId,
      outputKey,
      outputUrl: result.s3Url || `https://${getBucketName()}.s3.${REGION}.amazonaws.com/${outputKey}`,
      videoCount: videoClips.length,
    });
  } catch (error: any) {
    console.error('Failed to invoke FFmpeg Lambda:', error);
    return NextResponse.json(
      { error: `Failed to invoke FFmpeg Lambda: ${error.message}` },
      { status: 500 }
    );
  }
}

export const POST = withErrorHandlingV2<any>(postHandler);

