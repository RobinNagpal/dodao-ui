// Text-to-Speech Service with S3 integration
import fs from "node:fs";
import path from "node:path";
import { StorageService, getPresentationPaths, formatSlideNumber } from "./storage-service";
import { getTempDir, ensureDir } from "./utils";
import type { GenerateSlideAudioResponse } from "./types";

/**
 * Generate audio using Edge TTS and upload to S3 (legacy path structure)
 * Kept for backward compatibility
 */
export async function generateAudioToS3(
  slideId: string,
  narration: string,
  bucket: string,
  keyPrefix: string = "",
  voice: string = "en-US-JennyNeural"
): Promise<{ audioUrl: string; duration: number; localPath: string }> {
  // Dynamic import for edge-tts-universal (ESM module)
  const { EdgeTTS } = await import("edge-tts-universal");

  if (!narration?.trim()) {
    throw new Error(`Narration is empty for slide ${slideId}`);
  }

  console.log(`Generating audio for slide ${slideId}...`);

  // Create TTS instance
  const tts = new EdgeTTS(narration, voice, {
    rate: "+0%",
    pitch: "+0Hz",
    volume: "+0%",
  });

  // Synthesize audio
  const result = await tts.synthesize();

  // Get audio as buffer
  const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

  // Save to temporary local file
  const tmpDir = path.join(getTempDir(), "audio");
  ensureDir(tmpDir);
  const localPath = path.join(tmpDir, `${slideId}.mp3`);
  fs.writeFileSync(localPath, audioBuffer);

  // Upload to S3 and get presigned URL for Remotion Lambda to access
  const storage = new StorageService();
  const s3Key = `${keyPrefix}audios/${slideId}.mp3`;
  // Use presigned URL so Remotion Lambda can download the audio file
  const audioUrl = await storage.uploadFile(bucket, s3Key, localPath, "audio/mpeg", true);

  // Estimate duration (rough approximation based on narration length)
  const wordsPerMinute = 150;
  const words = narration.split(/\s+/).length;
  const duration = (words / wordsPerMinute) * 60;

  console.log(`Audio generated for slide ${slideId}: ${audioUrl.substring(0, 80)}...`);

  return { audioUrl, duration, localPath };
}

/**
 * Generate audio for a slide in a presentation (new path structure)
 */
export async function generateSlideAudio(
  presentationId: string,
  slideNumber: string,
  narration: string,
  outputBucket: string,
  voice: string = "en-US-JennyNeural"
): Promise<GenerateSlideAudioResponse> {
  try {
    // Dynamic import for edge-tts-universal (ESM module)
    const { EdgeTTS } = await import("edge-tts-universal");

    const formattedSlideNumber = formatSlideNumber(slideNumber);

    if (!narration?.trim()) {
      throw new Error(`Narration is empty for slide ${formattedSlideNumber}`);
    }

    console.log(`Generating audio for presentation ${presentationId}, slide ${formattedSlideNumber}...`);

    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);
    const paths = getPresentationPaths(presentationId, outputBucket);
    const slidePaths = paths.output(formattedSlideNumber);

    // Step 1: Save audio script
    const audioScriptUrl = await storage.saveAudioScript(
      outputBucket,
      presentationId,
      formattedSlideNumber,
      narration
    );
    console.log(`Saved audio script: ${audioScriptUrl}`);

    // Step 2: Generate audio with Edge TTS
    const tts = new EdgeTTS(narration, voice, {
      rate: "+0%",
      pitch: "+0Hz",
      volume: "+0%",
    });

    const result = await tts.synthesize();
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    // Save to temporary local file (needed for duration parsing)
    const tmpDir = path.join(getTempDir(), "audio");
    ensureDir(tmpDir);
    // Replace slashes in presentationId to create valid filename
    const safePresId = presentationId.replace(/\//g, "-");
    const localPath = path.join(tmpDir, `${safePresId}-${formattedSlideNumber}.mp3`);
    fs.writeFileSync(localPath, audioBuffer);

    // Step 3: Upload audio to S3 with proper path
    // Return direct S3 URL for storage (not presigned URL that expires)
    // Make audio public so it can be played in UI without authentication
    const audioUrl = await storage.uploadFile(
      outputBucket,
      slidePaths.audio,
      localPath,
      "audio/mpeg",
      false, // Return direct S3 URL for storage
      true  // Make public for UI playback
    );

    // Also generate a presigned URL for immediate Remotion Lambda use
    const audioPresignedUrl = await storage.getPresignedUrl(outputBucket, slidePaths.audio, 3600);

    // Estimate duration
    const wordsPerMinute = 150;
    const words = narration.split(/\s+/).length;
    const duration = (words / wordsPerMinute) * 60;

    console.log(`Audio generated: ${audioUrl}`);

    return {
      success: true,
      presentationId,
      slideNumber: formattedSlideNumber,
      audioScriptUrl,
      audioUrl, // Direct S3 URL for storage
      audioPresignedUrl, // Presigned URL for immediate Remotion use
      duration,
    };
  } catch (error) {
    console.error(`Error generating audio for slide ${slideNumber}:`, error);
    return {
      success: false,
      presentationId,
      slideNumber: formatSlideNumber(slideNumber),
      audioScriptUrl: "",
      audioUrl: "",
      duration: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Download audio from S3 to local temp file
 */
export async function downloadAudioFromS3(
  bucket: string,
  key: string,
  slideId: string
): Promise<string> {
  const storage = new StorageService();
  const tmpDir = path.join(getTempDir(), "audio");
  ensureDir(tmpDir);
  const localPath = path.join(tmpDir, `${slideId}.mp3`);

  await storage.downloadFile(bucket, key, localPath);
  return localPath;
}
