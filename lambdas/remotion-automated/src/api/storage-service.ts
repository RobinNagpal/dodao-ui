// Storage Service - Unified S3 path management and operations
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs";
import path from "node:path";
import type {
  PresentationPaths,
  SlideOutputPaths,
  SlideAndScriptPreferences,
  GeneratedContentAll,
  RenderMetadata,
  SlideInput,
} from "./types";

/**
 * Get paths for a presentation
 */
export function getPresentationPaths(presentationId: string, bucket: string): PresentationPaths {
  const basePath = presentationId;

  return {
    presentationId,
    bucket,
    inputs: {
      preferences: `${basePath}/inputs/slide-and-script-preferences.json`,
      prompt: `${basePath}/inputs/prompt.txt`,
    },
    middle: {
      generatedContent: `${basePath}/middle/generated-slide-content-all.json`,
    },
    output: (slideNumber: string): SlideOutputPaths => ({
      text: `${basePath}/output/${slideNumber}-slide/generated-slide-text.json`,
      image: `${basePath}/output/${slideNumber}-slide/generated-slide-image.png`,
      audioScript: `${basePath}/output/${slideNumber}-slide/generated-slide-audio-script.txt`,
      audio: `${basePath}/output/${slideNumber}-slide/generated-slide-audio.mp3`,
      video: `${basePath}/output/${slideNumber}-slide/generated-slide-video.mp4`,
      renderMetadata: `${basePath}/output/${slideNumber}-slide/render-metadata.json`,
    }),
  };
}

/**
 * Format slide number to 2 digits (e.g., "1" -> "01", "10" -> "10")
 */
export function formatSlideNumber(num: number | string): string {
  const n = typeof num === "string" ? parseInt(num, 10) : num;
  return n.toString().padStart(2, "0");
}

export class StorageService {
  private s3Client: S3Client;
  private region: string;

  constructor(region: string = process.env.AWS_REGION || "us-east-1") {
    this.region = region;
    this.s3Client = new S3Client({ region: this.region });
  }

  /**
   * Get public S3 URL
   */
  getS3Url(bucket: string, key: string): string {
    return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Get presigned URL for temporary access
   */
  async getPresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Check if object exists in S3
   */
  async objectExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Upload JSON data to S3
   */
  async uploadJson(bucket: string, key: string, data: unknown): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: "application/json",
      })
    );
    return this.getS3Url(bucket, key);
  }

  /**
   * Upload text to S3
   */
  async uploadText(bucket: string, key: string, text: string): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: text,
        ContentType: "text/plain; charset=utf-8",
      })
    );
    return this.getS3Url(bucket, key);
  }

  /**
   * Upload file from local path to S3
   */
  async uploadFile(
    bucket: string,
    key: string,
    filePath: string,
    contentType?: string,
    returnPresignedUrl: boolean = false
  ): Promise<string> {
    const fileContent = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const contentTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".json": "application/json",
      ".txt": "text/plain",
    };

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType || contentTypes[ext] || "application/octet-stream",
      })
    );

    if (returnPresignedUrl) {
      return this.getPresignedUrl(bucket, key, 3600);
    }
    return this.getS3Url(bucket, key);
  }

  /**
   * Upload buffer to S3
   */
  async uploadBuffer(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return this.getS3Url(bucket, key);
  }

  /**
   * Download JSON from S3
   */
  async downloadJson<T>(bucket: string, key: string): Promise<T | null> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
      );
      const bodyString = await response.Body?.transformToString();
      if (!bodyString) return null;
      return JSON.parse(bodyString) as T;
    } catch {
      return null;
    }
  }

  /**
   * Download text from S3
   */
  async downloadText(bucket: string, key: string): Promise<string | null> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
      );
      return (await response.Body?.transformToString()) || null;
    } catch {
      return null;
    }
  }

  /**
   * Download file from S3 to local path
   */
  async downloadFile(bucket: string, key: string, localPath: string): Promise<void> {
    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = response.Body as any;
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    fs.writeFileSync(localPath, Buffer.concat(chunks));
  }

  /**
   * List objects with prefix
   */
  async listObjects(bucket: string, prefix: string): Promise<string[]> {
    const response = await this.s3Client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
    );
    return (response.Contents || []).map((obj) => obj.Key || "").filter(Boolean);
  }

  // ==================== Presentation-specific operations ====================

  /**
   * Save slide and script preferences
   */
  async savePreferences(
    bucket: string,
    presentationId: string,
    preferences: SlideAndScriptPreferences
  ): Promise<string> {
    const paths = getPresentationPaths(presentationId, bucket);
    return this.uploadJson(bucket, paths.inputs.preferences, preferences);
  }

  /**
   * Load slide and script preferences
   */
  async loadPreferences(
    bucket: string,
    presentationId: string
  ): Promise<SlideAndScriptPreferences | null> {
    const paths = getPresentationPaths(presentationId, bucket);
    return this.downloadJson<SlideAndScriptPreferences>(bucket, paths.inputs.preferences);
  }

  /**
   * Save prompt
   */
  async savePrompt(bucket: string, presentationId: string, prompt: string): Promise<string> {
    const paths = getPresentationPaths(presentationId, bucket);
    return this.uploadText(bucket, paths.inputs.prompt, prompt);
  }

  /**
   * Save generated content from AI
   */
  async saveGeneratedContent(
    bucket: string,
    presentationId: string,
    content: GeneratedContentAll
  ): Promise<string> {
    const paths = getPresentationPaths(presentationId, bucket);
    return this.uploadJson(bucket, paths.middle.generatedContent, content);
  }

  /**
   * Load generated content
   */
  async loadGeneratedContent(
    bucket: string,
    presentationId: string
  ): Promise<GeneratedContentAll | null> {
    const paths = getPresentationPaths(presentationId, bucket);
    return this.downloadJson<GeneratedContentAll>(bucket, paths.middle.generatedContent);
  }

  /**
   * Save slide text JSON
   */
  async saveSlideText(
    bucket: string,
    presentationId: string,
    slideNumber: string,
    slide: SlideInput
  ): Promise<string> {
    const paths = getPresentationPaths(presentationId, bucket);
    const slidePaths = paths.output(slideNumber);
    return this.uploadJson(bucket, slidePaths.text, {
      slideNumber,
      slide,
      savedAt: new Date().toISOString(),
    });
  }

  /**
   * Load slide text JSON
   */
  async loadSlideText(
    bucket: string,
    presentationId: string,
    slideNumber: string
  ): Promise<{ slideNumber: string; slide: SlideInput } | null> {
    const paths = getPresentationPaths(presentationId, bucket);
    const slidePaths = paths.output(slideNumber);
    return this.downloadJson<{ slideNumber: string; slide: SlideInput }>(bucket, slidePaths.text);
  }

  /**
   * Save audio script
   */
  async saveAudioScript(
    bucket: string,
    presentationId: string,
    slideNumber: string,
    narration: string
  ): Promise<string> {
    const paths = getPresentationPaths(presentationId, bucket);
    const slidePaths = paths.output(slideNumber);
    return this.uploadText(bucket, slidePaths.audioScript, narration);
  }

  /**
   * Save render metadata (tracks image and video render status)
   */
  async saveRenderMetadata(
    bucket: string,
    presentationId: string,
    slideNumber: string,
    metadata: RenderMetadata
  ): Promise<string> {
    const paths = getPresentationPaths(presentationId, bucket);
    const slidePaths = paths.output(slideNumber);
    return this.uploadJson(bucket, slidePaths.renderMetadata, metadata);
  }

  /**
   * Load render metadata
   */
  async loadRenderMetadata(
    bucket: string,
    presentationId: string,
    slideNumber: string
  ): Promise<RenderMetadata | null> {
    const paths = getPresentationPaths(presentationId, bucket);
    const slidePaths = paths.output(slideNumber);
    return this.downloadJson<RenderMetadata>(bucket, slidePaths.renderMetadata);
  }

  /**
   * Update image render info in metadata (preserves video info)
   */
  async updateImageRenderMetadata(
    bucket: string,
    presentationId: string,
    slideNumber: string,
    imageInfo: RenderMetadata["image"]
  ): Promise<string> {
    // Load existing metadata or create new
    let metadata = await this.loadRenderMetadata(bucket, presentationId, slideNumber);

    if (!metadata) {
      metadata = {
        slideNumber,
        bucketName: bucket,
        updatedAt: new Date().toISOString(),
      };
    }

    // Update image info
    metadata.image = imageInfo;
    metadata.updatedAt = new Date().toISOString();

    return this.saveRenderMetadata(bucket, presentationId, slideNumber, metadata);
  }

  /**
   * Update video render info in metadata (preserves image info)
   */
  async updateVideoRenderMetadata(
    bucket: string,
    presentationId: string,
    slideNumber: string,
    videoInfo: RenderMetadata["video"]
  ): Promise<string> {
    // Load existing metadata or create new
    let metadata = await this.loadRenderMetadata(bucket, presentationId, slideNumber);

    if (!metadata) {
      metadata = {
        slideNumber,
        bucketName: bucket,
        updatedAt: new Date().toISOString(),
      };
    }

    // Update video info
    metadata.video = videoInfo;
    metadata.updatedAt = new Date().toISOString();

    return this.saveRenderMetadata(bucket, presentationId, slideNumber, metadata);
  }

  /**
   * Build actual Remotion output URL (with renders/{renderId}/ prefix)
   */
  getRemotionOutputUrl(bucket: string, renderId: string, outName: string): string {
    return `https://${bucket}.s3.${this.region}.amazonaws.com/renders/${renderId}/${outName}`;
  }

  /**
   * Get slide output paths
   */
  getSlidePaths(presentationId: string, bucket: string, slideNumber: string): SlideOutputPaths {
    const paths = getPresentationPaths(presentationId, bucket);
    return paths.output(slideNumber);
  }

  /**
   * Get all slide numbers for a presentation
   */
  async getSlideNumbers(bucket: string, presentationId: string): Promise<string[]> {
    const prefix = `${presentationId}/output/`;
    const objects = await this.listObjects(bucket, prefix);

    // Extract unique slide numbers from paths like "{id}/output/01-slide/..."
    const slideNumbers = new Set<string>();
    for (const key of objects) {
      const match = key.match(/\/output\/(\d+)-slide\//);
      if (match) {
        slideNumbers.add(match[1]);
      }
    }

    return Array.from(slideNumbers).sort();
  }
}

