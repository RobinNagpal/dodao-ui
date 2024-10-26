import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3 } from 'aws-sdk';

export const s3Config = {
  bucketName: String(process.env.PUBLIC_AWS_S3_BUCKET),
  defaultRegion: String(process.env.DEFAULT_REGION),
};

export class PresignedUrlCreator {
  private client: S3;

  constructor() {
    this.client = new S3({
      region: s3Config.defaultRegion,
    });
  }

  async createSignedUrl(contentType: string, createKeyFunction: () => string): Promise<string> {
    const client: S3Client = new S3Client({
      region: s3Config.defaultRegion,
    });
    const command = new PutObjectCommand({
      Key: createKeyFunction(),
      Bucket: s3Config.bucketName,
      ContentType: contentType,
      ACL: ObjectCannedACL.public_read,
    });
    return await getSignedUrl(client as any, command as any, { expiresIn: 3600 });
  }
}

export const presignedUrlCreator = new PresignedUrlCreator();
