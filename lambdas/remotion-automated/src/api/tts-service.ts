// Text-to-Speech Service with S3 integration using AWS Polly
import fs from "node:fs";
import path from "node:path";
import { PollyClient, SynthesizeSpeechCommand, Engine, OutputFormat, VoiceId } from "@aws-sdk/client-polly";
import { StorageService, getPresentationPaths, formatSlideNumber } from "./storage-service";
import { getTempDir, ensureDir } from "./utils";
import type { GenerateSlideAudioResponse } from "./types";

// AWS Polly Engine types
export type PollyEngine = "generative" | "long-form" | "neural" | "standard";

// Default voice configuration
const DEFAULT_VOICE: VoiceId = "Ruth"; // Female voice with generative engine support
const DEFAULT_ENGINE: PollyEngine = "generative";

/**
 * Parse voice string to extract voice ID and engine
 * Format: "VoiceId" or "VoiceId:engine" (e.g., "Ruth" or "Ruth:generative")
 */
function parseVoiceConfig(voice?: string): { voiceId: VoiceId; engine: Engine } {
  if (!voice) {
    return { voiceId: DEFAULT_VOICE, engine: DEFAULT_ENGINE };
  }

  const parts = voice.split(":");
  const voiceId = (parts[0] || DEFAULT_VOICE) as VoiceId;
  const engine = (parts[1] as PollyEngine) || DEFAULT_ENGINE;

  // Validate engine
  const validEngines: Engine[] = ["generative", "long-form", "neural", "standard"];
  const selectedEngine = validEngines.includes(engine as Engine) ? (engine as Engine) : DEFAULT_ENGINE;

  return { voiceId, engine: selectedEngine };
}

/**
 * Generate audio using AWS Polly and upload to S3 (legacy path structure)
 * Kept for backward compatibility
 */
export async function generateAudioToS3(
  slideId: string,
  narration: string,
  bucket: string,
  keyPrefix: string = "",
  voice: string = "Ruth"
): Promise<{ audioUrl: string; duration: number; localPath: string }> {
  if (!narration?.trim()) {
    throw new Error(`Narration is empty for slide ${slideId}`);
  }

  console.log(`Generating audio for slide ${slideId} using AWS Polly...`);

  const region = process.env.AWS_REGION || "us-east-1";
  const pollyClient = new PollyClient({ region });

  const { voiceId, engine } = parseVoiceConfig(voice);

  console.log(`Using voice: ${voiceId}, engine: ${engine}`);

  // Synthesize speech using AWS Polly
  const command = new SynthesizeSpeechCommand({
    Text: narration,
    OutputFormat: OutputFormat.MP3,
    VoiceId: voiceId,
    Engine: engine,
  });

  const response = await pollyClient.send(command);

  if (!response.AudioStream) {
    throw new Error("No audio stream returned from Polly");
  }

  // Convert stream to Uint8Array
  const audioBytes = await response.AudioStream.transformToByteArray();

  // Save to temporary local file
  const tmpDir = path.join(getTempDir(), "audio");
  ensureDir(tmpDir);
  const localPath = path.join(tmpDir, `${slideId}.mp3`);
  fs.writeFileSync(localPath, audioBytes);

  // Upload to S3 and get presigned URL for Remotion Lambda to access
  const storage = new StorageService();
  const s3Key = `${keyPrefix}audios/${slideId}.mp3`;
  // Use presigned URL so Remotion Lambda can download the audio file
  const audioUrl = await storage.uploadFile(bucket, s3Key, localPath, "audio/mpeg", true);

  // Estimate duration from audio size (rough approximation for MP3 at ~128kbps)
  // More accurate than word count for synthesized speech
  const audioBitrate = 128 * 1024 / 8; // 128kbps in bytes per second
  const duration = audioBytes.length / audioBitrate;

  console.log(`Audio generated for slide ${slideId}: ${audioUrl.substring(0, 80)}...`);

  return { audioUrl, duration, localPath };
}

/**
 * Generate audio for a slide in a presentation (new path structure)
 * Uses AWS Polly with generative engine for natural-sounding voices
 * 
 * @param voice - Voice configuration in format "VoiceId" or "VoiceId:engine"
 *                Examples: "Ruth", "Matthew:neural", "Joanna:long-form"
 *                Default: "Ruth" with generative engine
 *                Available engines: generative, long-form, neural, standard
 */
export async function generateSlideAudio(
  presentationId: string,
  slideNumber: string,
  narration: string,
  outputBucket: string,
  voice: string = "Ruth"
): Promise<GenerateSlideAudioResponse> {
  try {
    const formattedSlideNumber = formatSlideNumber(slideNumber);

    if (!narration?.trim()) {
      throw new Error(`Narration is empty for slide ${formattedSlideNumber}`);
    }

    console.log(`Generating audio for presentation ${presentationId}, slide ${formattedSlideNumber} using AWS Polly...`);

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

    // Step 2: Generate audio with AWS Polly
    const pollyClient = new PollyClient({ region });
    const { voiceId, engine } = parseVoiceConfig(voice);

    console.log(`Using voice: ${voiceId}, engine: ${engine}`);

    const command = new SynthesizeSpeechCommand({
      Text: narration,
      OutputFormat: OutputFormat.MP3,
      VoiceId: voiceId,
      Engine: engine,
    });

    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      throw new Error("No audio stream returned from Polly");
    }

    // Convert stream to Uint8Array
    const audioBytes = await response.AudioStream.transformToByteArray();

    // Save to temporary local file (needed for duration parsing)
    const tmpDir = path.join(getTempDir(), "audio");
    ensureDir(tmpDir);
    // Replace slashes in presentationId to create valid filename
    const safePresId = presentationId.replace(/\//g, "-");
    const localPath = path.join(tmpDir, `${safePresId}-${formattedSlideNumber}.mp3`);
    fs.writeFileSync(localPath, audioBytes);

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

    // Estimate duration from audio size (rough approximation for MP3 at ~128kbps)
    // More accurate than word count for synthesized speech
    const audioBitrate = 128 * 1024 / 8; // 128kbps in bytes per second
    const duration = audioBytes.length / audioBitrate;

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
