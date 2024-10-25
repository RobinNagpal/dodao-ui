import { S3Event, S3Handler } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as unzipper from "unzipper";
import { Readable } from "stream";

const s3Client = new S3Client({});

export const unzipperHandler: S3Handler = async (event: S3Event) => {
  console.log("Received S3 event:", JSON.stringify(event, null, 2));

  // Extract bucket name and object key from the event
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  console.log(`Processing file: ${key} from bucket: ${bucket}`);

  // check if key is a zip file else return
  if (!key.endsWith(".zip")) {
    console.log("Key is not a zip file");
    return;
  }

  try {
    // Get the object from S3
    const getObjectParams = {
      Bucket: bucket,
      Key: key,
    };

    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const response = await s3Client.send(getObjectCommand);

    if (!response.Body) {
      throw new Error("No content in the S3 object");
    }

    const zipObjectStream = response.Body as Readable;

    // Prepare an array to hold upload promises
    const uploadPromises: Promise<any>[] = [];

    // Use unzipper to parse the zip file stream
    await new Promise<void>((resolve, reject) => {
      zipObjectStream
        .pipe(unzipper.Parse())
        .on("entry", (entry: unzipper.Entry) => {
          const fileName = entry.path;
          const type = entry.type; // 'Directory' or 'File'

          if (type === "File") {
            // Construct the new key by replacing the zip file name with the extracted file name
            const baseKey = key.substring(0, key.lastIndexOf("/") + 1);
            const newKey = `${baseKey}${fileName}`;

            console.log(`Uploading extracted file to: ${newKey}`);

            // Upload the file back to S3
            const uploadParams = {
              Bucket: bucket,
              Key: newKey,
              Body: entry, // The entry is a stream
            };

            const upload = new Upload({
              client: s3Client,
              params: uploadParams,
            });

            const uploadPromise = upload.done();
            uploadPromises.push(uploadPromise);
          } else {
            // If it's a directory, drain the stream
            entry.autodrain();
          }
        })
        .on("error", (err) => {
          console.error("Error during unzip:", err);
          reject(err);
        })
        .on("close", () => {
          console.log("Finished unzipping");
          resolve();
        });
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    console.log("All files have been uploaded successfully.");
  } catch (error) {
    console.error("Error processing S3 event:", error);
    throw error;
  }
};
