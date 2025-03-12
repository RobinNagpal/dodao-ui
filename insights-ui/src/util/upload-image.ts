import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { InsightsConstants } from './insights-constants';

export async function uploadImageToS3(file: File, fileName: string) {
  const fileBuffer = await file.arrayBuffer();
  const bucketName = InsightsConstants.S3_BUCKET_NAME;
  const key = `images/${fileName}`;
  const response = await fetch(`${getBaseUrl()}/api/upload`, {
    method: 'POST',
    headers: {
      'x-file-name': fileName, // Pass filename in headers
      'x-file-type': file.type, // Pass file type in headers
      'Content-Type': 'application/octet-stream', // Binary file upload
    },
    body: fileBuffer, // Send the file buffer
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  const { url } = await response.json();
  if (url) {
    return url;
  } else {
    return `https://${bucketName}.s3.us-east-1.amazonaws.com/${key}`;
  }
}
