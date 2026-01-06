// S3 Helper Functions
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs";
import path from "node:path";

export class S3Helper {
  private s3Client: S3Client;
  private region: string;

  constructor(region: string = process.env.AWS_REGION || "us-east-1") {
    this.region = region;
    this.s3Client = new S3Client({ region: this.region });
  }

  /**
   * Upload a file to S3
   * @param bucket - S3 bucket name
   * @param key - S3 object key
   * @param filePath - Local file path
   * @param contentType - MIME type
   * @param returnPresignedUrl - If true, returns a presigned URL instead of public URL
   */
  async uploadFile(
    bucket: string,
    key: string,
    filePath: string,
    contentType?: string,
    returnPresignedUrl: boolean = false
  ): Promise<string> {
    const fileContent = fs.readFileSync(filePath);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType || this.getContentType(filePath),
      })
    );

    if (returnPresignedUrl) {
      // Return presigned URL valid for 1 hour (enough for rendering)
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
   * Download file from S3 to local path
   */
  async downloadFile(bucket: string, key: string, localPath: string): Promise<void> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const dir = path.dirname(localPath);
    fs.mkdirSync(dir, { recursive: true });

    const stream = response.Body as any;
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    fs.writeFileSync(localPath, Buffer.concat(chunks));
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(bucket: string, key: string) {
    const response = await this.s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType,
      lastModified: response.LastModified,
    };
  }

  /**
   * Generate presigned URL for temporary access
   */
  async getPresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Get public S3 URL
   */
  getS3Url(bucket: string, key: string): string {
    return `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Parse S3 URL or key
   */
  parseS3Url(urlOrKey: string): { bucket: string; key: string } | null {
    // Handle S3 URL: https://bucket.s3.region.amazonaws.com/key
    const s3UrlMatch = urlOrKey.match(/https:\/\/([^.]+)\.s3\.[^.]+\.amazonaws\.com\/(.+)/);
    if (s3UrlMatch) {
      return { bucket: s3UrlMatch[1], key: s3UrlMatch[2] };
    }

    // Handle s3:// protocol
    const s3ProtocolMatch = urlOrKey.match(/s3:\/\/([^/]+)\/(.+)/);
    if (s3ProtocolMatch) {
      return { bucket: s3ProtocolMatch[1], key: s3ProtocolMatch[2] };
    }

    // Assume it's just a key
    return null;
  }

  /**
   * Determine content type from file extension
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".json": "application/json",
    };
    return contentTypes[ext] || "application/octet-stream";
  }
}
