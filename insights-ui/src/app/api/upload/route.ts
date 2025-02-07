import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { InsightsConstants } from '@/util/insights-constants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function postHandler(req: NextRequest): Promise<NextResponse<{ url: string }>> {
  const bodyBuffer = await req.arrayBuffer();
  console.log(`Received file with ${bodyBuffer.byteLength} bytes`);
  const fileName = req.headers.get('x-file-name');
  const fileType = req.headers.get('x-file-type');

  const bucketName = InsightsConstants.S3_BUCKET_NAME;
  const key = `images/${fileName}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: new Uint8Array(bodyBuffer),
    ContentType: fileType || undefined,
    ACL: 'public-read',
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const publicUrl = `https://${bucketName}.s3.${process.env.DEFAULT_REGION}.amazonaws.com/${key}`;
  console.log(`File uploaded successfully to: ${publicUrl}`);

  return NextResponse.json({ url: publicUrl }, { status: 200 });
}

export const POST = withErrorHandlingV2<{ url: string }>(postHandler);
