import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { PresentationPreferences, PresentationSummary, SlideStatus, Slide } from '@/types/presentation/presentation-types';

// Remotion Lambda URL
const REMOTION_LAMBDA_URL = process.env.REMOTION_LAMBDA_URL;

// Use specific credentials for this functionality
const REGION = process.env.HASSAAN_AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'remotionlambda-useast1-ele686axd8';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.HASSAAN_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.HASSAAN_AWS_SECRET_ACCESS_KEY!,
  },
});

export const PRESENTATIONS_PREFIX = 'presentations';

/**
 * Call Remotion Lambda API endpoint
 */
export async function callRemotionLambda(endpoint: string, payload: any): Promise<any> {
  if (!REMOTION_LAMBDA_URL) {
    throw new Error('REMOTION_LAMBDA_URL environment variable is not configured');
  }

  const response = await fetch(`${REMOTION_LAMBDA_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Failed to call ${endpoint}`);
  }

  return result;
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Check if an S3 object exists
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get JSON content from S3
 */
export async function getJsonFromS3<T>(key: string): Promise<T | null> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    const body = response.Body instanceof Readable ? await streamToString(response.Body) : await new Response(response.Body as ReadableStream).text();

    return JSON.parse(body) as T;
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Put JSON content to S3
 */
export async function putJsonToS3(key: string, data: any): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Upload file to S3 (for images)
 */
export async function uploadFileToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read', // Make images public so Remotion Lambda can access them
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Delete a single object from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error(`Failed to delete ${key}:`, error);
    return false;
  }
}

/**
 * Delete all objects with a given prefix from S3
 */
export async function deleteAllWithPrefix(prefix: string): Promise<boolean> {
  try {
    // First, list all objects with the prefix
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      })
    );

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return true; // Nothing to delete
    }

    // Delete all objects
    const objectsToDelete = listResponse.Contents.map((obj) => ({ Key: obj.Key! }));

    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objectsToDelete,
          Quiet: true,
        },
      })
    );

    return true;
  } catch (error) {
    console.error(`Failed to delete objects with prefix ${prefix}:`, error);
    return false;
  }
}

/**
 * Delete entire presentation from S3
 */
export async function deletePresentation(presentationId: string): Promise<boolean> {
  const prefix = `${PRESENTATIONS_PREFIX}/${presentationId}/`;
  return deleteAllWithPrefix(prefix);
}

/**
 * Delete a slide from presentation (removes from preferences and deletes artifacts)
 */
export async function deleteSlideFromPresentation(presentationId: string, slideNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    // First, get the current preferences
    const preferences = await getPresentationPreferences(presentationId);
    if (!preferences) {
      return { success: false, error: 'Presentation not found' };
    }

    // Remove the slide from preferences
    const updatedSlides = preferences.slides.filter((s) => s.slideNumber !== slideNumber);

    if (updatedSlides.length === preferences.slides.length) {
      return { success: false, error: 'Slide not found' };
    }

    // Renumber remaining slides
    const renumberedSlides = updatedSlides.map((s, index) => ({
      ...s,
      slideNumber: String(index + 1).padStart(2, '0'),
    }));

    // Save updated preferences
    const updatedPreferences = {
      ...preferences,
      slides: renumberedSlides,
    };
    await savePresentationPreferences(updatedPreferences);

    // Delete slide artifacts
    const slidePrefix = `${PRESENTATIONS_PREFIX}/${presentationId}/output/${slideNumber}-slide/`;
    await deleteAllWithPrefix(slidePrefix);

    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete slide ${slideNumber}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a new slide to presentation
 */
export async function addSlideToPresentation(presentationId: string, slide: any): Promise<{ success: boolean; slideNumber?: string; error?: string }> {
  try {
    console.log('Getting preferences for:', presentationId);
    const preferences = await getPresentationPreferences(presentationId);
    if (!preferences) {
      console.log('Presentation not found:', presentationId);
      return { success: false, error: 'Presentation not found' };
    }

    console.log('Current preferences slides count:', preferences.slides.length);

    const newSlideNumber = String(preferences.slides.length + 1).padStart(2, '0');
    const newSlide = {
      slideNumber: newSlideNumber,
      slide: {
        ...slide,
        id: slide.id || `slide-${preferences.slides.length + 1}`,
      },
    };

    // Create updated preferences with new slide and updated timestamp
    const updatedPreferences = {
      ...preferences,
      slides: [...preferences.slides, newSlide],
      updatedAt: new Date().toISOString(),
    };

    console.log('Saving updated preferences with', updatedPreferences.slides.length, 'slides');

    const savedUrl = await savePresentationPreferences(updatedPreferences);
    console.log('Preferences saved to:', savedUrl);

    // Verify the save by reading back (helps with debugging)
    const verifyPrefs = await getPresentationPreferences(presentationId);
    console.log('Verification - slides count after save:', verifyPrefs?.slides.length);

    if (!verifyPrefs || verifyPrefs.slides.length !== updatedPreferences.slides.length) {
      console.error('Verification failed - slide count mismatch');
      return { success: false, error: 'Failed to verify slide was saved' };
    }

    console.log('Slide added successfully:', newSlideNumber);
    return { success: true, slideNumber: newSlideNumber };
  } catch (error: any) {
    console.error('Error adding slide:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all presentations
 */
export async function listPresentations(): Promise<PresentationSummary[]> {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${PRESENTATIONS_PREFIX}/`,
      Delimiter: '/',
    })
  );

  const presentationIds =
    response.CommonPrefixes?.map((cp) => {
      if (cp.Prefix) {
        return cp.Prefix.replace(`${PRESENTATIONS_PREFIX}/`, '').replace('/', '');
      }
      return null;
    }).filter((id): id is string => !!id) || [];

  // Get basic info for each presentation
  const summaries: PresentationSummary[] = [];

  for (const presentationId of presentationIds) {
    const preferencesKey = `${PRESENTATIONS_PREFIX}/${presentationId}/inputs/slide-and-script-preferences.json`;
    const hasPreferences = await objectExists(preferencesKey);

    let slideCount = 0;
    if (hasPreferences) {
      const prefs = await getJsonFromS3<PresentationPreferences>(preferencesKey);
      slideCount = prefs?.slides?.length || 0;
    }

    summaries.push({
      presentationId,
      hasPreferences,
      slideCount,
    });
  }

  return summaries;
}

/**
 * Get presentation preferences
 */
export async function getPresentationPreferences(presentationId: string): Promise<PresentationPreferences | null> {
  const key = `${PRESENTATIONS_PREFIX}/${presentationId}/inputs/slide-and-script-preferences.json`;
  console.log('Getting presentation preferences from key:', key);
  const result = await getJsonFromS3<PresentationPreferences>(key);
  console.log('Got preferences:', result);
  return result;
}

/**
 * Save presentation preferences
 */
export async function savePresentationPreferences(preferences: PresentationPreferences): Promise<string> {
  // Extract the actual presentation ID from the preferences.presentationId
  // preferences.presentationId is like "presentations/hassaan-test"
  // We need to extract "hassaan-test"
  const presentationId = preferences.presentationId.replace(`${PRESENTATIONS_PREFIX}/`, '');
  const key = `${PRESENTATIONS_PREFIX}/${presentationId}/inputs/slide-and-script-preferences.json`;
  console.log('Saving presentation preferences to key:', key, 'with data:', preferences);
  return putJsonToS3(key, preferences);
}

/**
 * Get detailed slide status for a presentation
 */
export async function getPresentationStatus(presentationId: string): Promise<{
  hasPreferences: boolean;
  hasPrompt: boolean;
  hasGeneratedContent: boolean;
  slides: SlideStatus[];
  hasFinalVideo: boolean;
  finalVideoUrl?: string;
  finalVideoLastModified?: number;
}> {
  const basePath = `${PRESENTATIONS_PREFIX}/${presentationId}`;

  // Check inputs
  const preferencesKey = `${basePath}/inputs/slide-and-script-preferences.json`;
  const promptKey = `${basePath}/inputs/prompt.txt`;
  const generatedContentKey = `${basePath}/middle/generated-slide-content-all.json`;
  const finalVideoKey = `${basePath}/output/final-video.mp4`;

  const [hasPreferences, hasPrompt, hasGeneratedContent, hasFinalVideo] = await Promise.all([
    objectExists(preferencesKey),
    objectExists(promptKey),
    objectExists(generatedContentKey),
    objectExists(finalVideoKey),
  ]);

  // Get final video last modified timestamp
  let finalVideoLastModified: number | undefined;
  if (hasFinalVideo) {
    try {
      const headResponse = await s3Client.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: finalVideoKey,
        })
      );
      finalVideoLastModified = headResponse.LastModified?.getTime();
    } catch (error) {
      console.warn('Failed to get final video last modified timestamp:', error);
    }
  }

  const slides: SlideStatus[] = [];

  if (hasPreferences) {
    const preferences = await getJsonFromS3<PresentationPreferences>(preferencesKey);
    if (preferences?.slides) {
      for (const sp of preferences.slides) {
        const slideNum = sp.slideNumber;
        const outputPath = `${basePath}/output/${slideNum}-slide`;

        // Check what exists for this slide
        const [hasText, hasAudioScript, hasAudio, hasVideo, renderMetadata] = await Promise.all([
          objectExists(`${outputPath}/generated-slide-text.json`),
          objectExists(`${outputPath}/generated-slide-audio-script.txt`),
          objectExists(`${outputPath}/generated-slide-audio.mp3`),
          checkVideoExists(presentationId, slideNum),
          getRenderMetadata(presentationId, slideNum),
        ]);

        let updatedRenderMetadata = renderMetadata;

        // Check and update render status for any items still rendering
        if (renderMetadata?.image?.status === 'rendering' && renderMetadata.image.renderId) {
          const updatedImageInfo = await checkAndUpdateRenderStatus(presentationId, slideNum, renderMetadata.image.renderId, 'image');
          if (updatedImageInfo) {
            updatedRenderMetadata = { ...renderMetadata, image: updatedImageInfo };
          }
        }

        if (renderMetadata?.video?.status === 'rendering' && renderMetadata.video.renderId) {
          const updatedVideoInfo = await checkAndUpdateRenderStatus(presentationId, slideNum, renderMetadata.video.renderId, 'video');
          if (updatedVideoInfo) {
            updatedRenderMetadata = { ...updatedRenderMetadata, video: updatedVideoInfo };
          }
        }

        // Check if image exists (need to check render metadata for the actual URL)
        const hasImage = !!updatedRenderMetadata?.image?.status && updatedRenderMetadata.image.status === 'completed';

        slides.push({
          slideNumber: slideNum,
          slide: sp.slide,
          hasText,
          hasImage,
          hasAudioScript,
          hasAudio,
          hasVideo: hasVideo.exists,
          audioUrl: updatedRenderMetadata?.audioUrl || (hasAudio ? getPresignedUrl(`${outputPath}/generated-slide-audio.mp3`) : undefined),
          imageUrl: updatedRenderMetadata?.image?.url,
          imageStatus: updatedRenderMetadata?.image?.status as SlideStatus['imageStatus'],
          imageRenderId: updatedRenderMetadata?.image?.renderId,
          videoUrl: hasVideo.url || updatedRenderMetadata?.video?.url,
          videoStatus: updatedRenderMetadata?.video?.status as SlideStatus['videoStatus'],
          videoRenderId: updatedRenderMetadata?.video?.renderId,
        });
      }
    }
  }

  return {
    hasPreferences,
    hasPrompt,
    hasGeneratedContent,
    slides,
    hasFinalVideo,
    finalVideoUrl: hasFinalVideo ? getCacheBustingVideoUrl(finalVideoKey, finalVideoLastModified) : undefined,
    finalVideoLastModified,
  };
}

type RenderStatus = 'pending' | 'rendering' | 'completed' | 'failed';

interface RenderInfo {
  renderId: string;
  status: RenderStatus;
  url?: string;
}

interface SlideRenderMetadata {
  image?: RenderInfo;
  video?: RenderInfo;
  audioUrl?: string;
}

/**
 * Get render metadata for a slide
 */
export async function getRenderMetadata(presentationId: string, slideNumber: string): Promise<SlideRenderMetadata | null> {
  const key = `${PRESENTATIONS_PREFIX}/${presentationId}/output/${slideNumber}-slide/render-metadata.json`;
  return getJsonFromS3<SlideRenderMetadata>(key);
}

/**
 * Check if video exists for a slide
 */
async function checkVideoExists(presentationId: string, slideNumber: string): Promise<{ exists: boolean; url?: string }> {
  // First check render metadata
  const metadata = await getRenderMetadata(presentationId, slideNumber);
  if (metadata?.video?.status === 'completed' && metadata.video.url) {
    return { exists: true, url: metadata.video.url };
  }

  // Fallback: check direct path (unlikely but possible)
  const directPath = `${PRESENTATIONS_PREFIX}/${presentationId}/output/${slideNumber}-slide/generated-slide-video.mp4`;
  const exists = await objectExists(directPath);
  if (exists) {
    return { exists: true, url: getPresignedUrl(directPath) };
  }

  return { exists: false };
}

/**
 * Generate a presigned-like URL (public URL for now)
 */
export function getPresignedUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Generate a cache-busting URL for videos to prevent browser caching
 */
export function getCacheBustingVideoUrl(key: string, lastModified?: number): string {
  const baseUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  if (lastModified) {
    return `${baseUrl}?t=${lastModified}`;
  }
  return baseUrl;
}

/**
 * Get bucket name
 */
export function getBucketName(): string {
  return BUCKET_NAME;
}

/**
 * Get presentations prefix
 */
export function getPresentationsPrefix(): string {
  return PRESENTATIONS_PREFIX;
}

/**
 * Check render status from Remotion Lambda and update if completed
 */
async function checkAndUpdateRenderStatus(
  presentationId: string,
  slideNumber: string,
  renderId: string,
  renderType: 'image' | 'video'
): Promise<RenderInfo | null> {
  if (!REMOTION_LAMBDA_URL) {
    console.error('REMOTION_LAMBDA_URL environment variable is not configured');
    return null;
  }

  try {
    const result = await callRemotionLambda('/render-status', {
      renderId,
      bucketName: BUCKET_NAME,
    });

    // If render is complete, update the metadata
    if (result.done) {
      const metadataKey = `${PRESENTATIONS_PREFIX}/${presentationId}/output/${slideNumber}-slide/render-metadata.json`;
      const currentMetadata = (await getJsonFromS3<SlideRenderMetadata>(metadataKey)) || {};

      // Update the render info
      const updatedRenderInfo: RenderInfo = {
        renderId,
        status: 'completed',
        url: result.outputUrl || `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${result.outputFile}`,
      };

      currentMetadata[renderType] = updatedRenderInfo;

      // Save updated metadata
      await putJsonToS3(metadataKey, currentMetadata);

      return updatedRenderInfo;
    } else if (result.overallProgress !== undefined) {
      // Still rendering, return current status
      return {
        renderId,
        status: 'rendering',
      };
    }

    return null;
  } catch (error) {
    console.error(`Error checking render status for ${renderId}:`, error);
    return null;
  }
}
