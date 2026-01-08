import { NextRequest } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { getPresentationStatus, getBucketName, getPresentationsPrefix } from '@/lib/presentation-s3-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { GenerateFinalVideoResponse } from '@/types/presentation/presentation-types';

// FFmpeg Lambda configuration
const FFMPEG_LAMBDA_NAME = process.env.FFMPEG_LAMBDA_NAME;
const REGION = process.env.HASSAAN_AWS_REGION;

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
async function postHandler(req: NextRequest, { params }: Params): Promise<GenerateFinalVideoResponse> {
  const { presentationId } = await params;

  // Get presentation status to find all video URLs
  const status = await getPresentationStatus(presentationId);

  if (!status.hasPreferences) {
    throw new Error('Presentation not found');
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
    throw new Error('No videos found. Please generate slide videos first.');
  }

  if (missingVideos.length > 0) {
    throw new Error(`Videos missing for slides: ${missingVideos.join(', ')}. Generate all slide videos first.`);
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
    const responsePayload = response.Payload ? JSON.parse(Buffer.from(response.Payload).toString()) : null;

    if (response.FunctionError) {
      console.error('FFmpeg Lambda error:', responsePayload);
      throw new Error(responsePayload?.errorMessage || 'FFmpeg Lambda execution failed');
    }

    // Parse the body from Lambda response
    let result;
    if (responsePayload?.body) {
      result = typeof responsePayload.body === 'string' ? JSON.parse(responsePayload.body) : responsePayload.body;
    } else {
      result = responsePayload;
    }

    if (!result?.success) {
      throw new Error(result?.error || 'Failed to merge videos');
    }

    return {
      success: true,
      presentationId,
      outputKey,
      outputUrl: result.s3Url || `https://${getBucketName()}.s3.${REGION}.amazonaws.com/${outputKey}`,
      videoCount: videoClips.length,
    };
  } catch (error: unknown) {
    console.error('Failed to invoke FFmpeg Lambda:', error);
    throw new Error(`Failed to invoke FFmpeg Lambda: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withErrorHandlingV2<GenerateFinalVideoResponse>(postHandler);
