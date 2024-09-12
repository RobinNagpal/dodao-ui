import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3 } from 'aws-sdk';
import { CreateSignedUrlInput } from '@/graphql/generated/generated-types';

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

  async createSignedUrl(spaceId: string, args: CreateSignedUrlInput): Promise<string> {
    const { imageType, contentType, objectId, name } = args;

    const client: S3Client = new S3Client({
      region: s3Config.defaultRegion,
    });
    const command = new PutObjectCommand({
      Key: `academy/${spaceId}/${imageType}/${objectId}/${Date.now()}_${name}`,
      Bucket: s3Config.bucketName,
      ContentType: contentType,
      ACL: ObjectCannedACL.public_read,
    });
    return await getSignedUrl(client as any, command as any, { expiresIn: 3600 });
  }
}

export const presignedUrlCreator = new PresignedUrlCreator();
