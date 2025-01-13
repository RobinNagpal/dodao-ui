import AWS from 'aws-sdk';
import * as fs from "fs";
import * as path from "path";

const s3 = new AWS.S3();
const bucketName = process.env.EMAIL_BUCKET_NAME!;
const emailFileKey = 'email-list.csv';

type RequestBody = {
  email?: string;
  action?: string;
};

export const manageSubscription = async (event: any) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  // Extract the HTTP method and other details from the event
  const method = event.requestContext?.http?.method; // Use the correct path for HTTP method
  
  // Decode and parse the body
  let body: RequestBody = {};
  if (event.body) {
    body = JSON.parse(event.body);
  }

  console.log("Parsed body:", body);
  const { email, action } = body;

  if (method === 'GET') {
    try {
      // Read the HTML file
      const htmlPath = path.join(__dirname, 'subscribe-page.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: html,
      };
    } catch (error) {
      console.error('Error reading HTML file:', error);
      return {
        statusCode: 500,
        body: 'Internal Server Error',
      };
    }
  }

  if (method === 'POST') {
    // Handle subscription logic
    if (!email || !action) {
      return { statusCode: 400, body: 'Email and action are required.' };
    }

    try {
      const file = await s3.getObject({ Bucket: bucketName, Key: emailFileKey }).promise();
      const emails = file.Body?.toString('utf-8').split(',') || [];

      if (action === 'subscribe' && !emails.includes(email)) {
        emails.push(email);
      } else if (action === 'unsubscribe') {
        const index = emails.indexOf(email);
        if (index !== -1) emails.splice(index, 1);
      }

      await s3
        .putObject({
          Bucket: bucketName,
          Key: emailFileKey,
          Body: emails.join(','),
          ContentType: 'text/plain',
        })
        .promise();

      return {
        statusCode: 200,
        body: `${action === 'subscribe' ? 'Subscribed' : 'Unsubscribed'} successfully.`,
      };
    } catch (error: any) {
      if (error.code === 'NoSuchKey') {
        if (action === 'subscribe') {
          await s3
            .putObject({
              Bucket: bucketName,
              Key: emailFileKey,
              Body: email,
              ContentType: 'text/plain',
            })
            .promise();
          return { statusCode: 200, body: 'Subscribed successfully.' };
        }
        return { statusCode: 400, body: 'No email list found for unsubscribing.' };
      }

      console.error(error);
      return { statusCode: 500, body: 'Internal Server Error.' };
    }
  }

  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Method Not Allowed' }),
  };
};
