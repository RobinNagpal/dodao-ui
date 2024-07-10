import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';
import fs from 'fs';

export const uploadFileToS3 = async (key: string, contentType: string, filePath: string) => {
  const fileContent = fs.readFileSync(filePath);

  const s3 = new S3({
    region: String(process.env.DEFAULT_REGION),
  });

  const command: S3.Types.PutObjectRequest = {
    Bucket: String(process.env.PUBLIC_AWS_S3_BUCKET),
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    ACL: ObjectCannedACL.public_read,
  };

  const output = await s3.upload(command).promise();
  return output.Location;
};
