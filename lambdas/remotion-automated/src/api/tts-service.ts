// Text-to-Speech Service with S3 integration
import fs from "node:fs";
import path from "node:path";
import { S3Helper } from "./s3-helper";
import { getTempDir, ensureDir } from "./utils";

/**
 * Generate audio using Edge TTS and upload to S3
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
  const s3Helper = new S3Helper();
  const s3Key = `${keyPrefix}audios/${slideId}.mp3`;
  // Use presigned URL so Remotion Lambda can download the audio file
  const audioUrl = await s3Helper.uploadFile(bucket, s3Key, localPath, "audio/mpeg", true);

  // Estimate duration (rough approximation based on narration length)
  // For more accurate duration, you'd need to parse the audio file
  const wordsPerMinute = 150;
  const words = narration.split(/\s+/).length;
  const duration = (words / wordsPerMinute) * 60;

  console.log(`Audio generated for slide ${slideId}: ${audioUrl.substring(0, 80)}...`);

  return { audioUrl, duration, localPath };
}

/**
 * Download audio from S3 to local temp file
 */
export async function downloadAudioFromS3(
  bucket: string,
  key: string,
  slideId: string
): Promise<string> {
  const s3Helper = new S3Helper();
  const tmpDir = path.join(getTempDir(), "audio");
  ensureDir(tmpDir);
  const localPath = path.join(tmpDir, `${slideId}.mp3`);

  await s3Helper.downloadFile(bucket, key, localPath);
  return localPath;
}
