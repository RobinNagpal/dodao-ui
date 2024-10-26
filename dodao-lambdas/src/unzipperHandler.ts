import { S3Event, S3Handler } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as yauzl from "yauzl";
import { Readable } from "stream";
import * as mime from "mime-types";

const s3Client = new S3Client({});

export const unzipperHandler: S3Handler = async (event: S3Event) => {
  console.log("Received S3 event:", JSON.stringify(event, null, 2));

  // Extract bucket name and object key from the event
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  console.log(`Processing file: ${key} from bucket: ${bucket}`);

  // Check if key is a zip file, else return
  if (!key.endsWith(".zip")) {
    console.log("Key is not a zip file");
    return;
  }

  const zipBaseName = key.substring(
    key.lastIndexOf("/") + 1,
    key.lastIndexOf(".zip")
  );

  const targetPath = key
    .substring(0, key.lastIndexOf("/") + 1)
    .replace("zipped-html-captures/", "unzipped-html-captures/");

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

    const zipBuffer = await streamToBuffer(response.Body as Readable);

    // Prepare an array to hold upload promises
    const uploadPromises: Promise<any>[] = [];

    // Use yauzl to open the zip file from the buffer
    await new Promise<void>((resolve, reject) => {
      yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
        if (err || !zipfile) {
          console.error("Error opening zip file:", err);
          return reject(err);
        }

        zipfile.readEntry();

        zipfile.on("entry", (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry, proceed to the next entry
            zipfile.readEntry();
          } else {
            // File entry
            zipfile.openReadStream(entry, (readStreamErr, readStream) => {
              if (readStreamErr || !readStream) {
                console.error("Error reading zip entry stream:", readStreamErr);
                return reject(readStreamErr);
              }

              const newKey = `${targetPath}${zipBaseName}/${entry.fileName}`;

              // Determine the content type based on the file extension
              const contentType =
                mime.lookup(entry.fileName) || "application/octet-stream";

              console.log(
                `Uploading extracted file to: ${newKey} with content type - ${contentType} `
              );

              const uploadParams = {
                Bucket: bucket,
                Key: newKey,
                Body: readStream, // The entry stream
                ACL: "public-read",
                ContentType: contentType, // Set the correct content type
                // ContentDisposition: "inline", // Suggests to display in the browser
              };

              const upload = new Upload({
                client: s3Client,
                params: uploadParams,
              });

              const uploadPromise = upload.done();
              uploadPromises.push(uploadPromise);

              readStream.on("end", () => zipfile.readEntry());
            });
          }
        });

        zipfile.on("end", () => {
          console.log("Finished unzipping");
          resolve();
        });

        zipfile.on("error", (err) => {
          console.error("Error during zip processing:", err);
          reject(err);
        });
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

// Helper function to convert a stream into a buffer
const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
};
