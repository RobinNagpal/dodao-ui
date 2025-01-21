import AWS from 'aws-sdk';
import * as fs from "fs";
import * as path from "path";

const s3 = new AWS.S3({ region: 'us-east-1' });
const bucketName = process.env.AWS_BUCKET!;
const emailPath = process.env.AWS_BUCKET_EMAIL_PATH;
const emailFileKey = emailPath ? `${emailPath}/email-list.txt` : 'email-list.txt'

type RequestBody = {
  email?: string;
  action?: string;
};

export const manageSubscription = async (event: any) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  // Extract the HTTP method and other details from the event
  const method = event.requestContext?.http?.method; 
  
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
      let emails: string[] = [];
      try {
        const file = await s3.getObject({ Bucket: bucketName, Key: emailFileKey }).promise();
        emails = file.Body?.toString('utf-8').split('\n').filter(Boolean) || []; // Split by lines and remove empty lines
      } catch (error: any) {
        if (error.code !== 'NoSuchKey') {
          throw error;
        }
        console.log('No existing email file found, creating a new one.');
      }

      if (action === 'subscribe' && !emails.includes(email)) {
        emails.push(email); // Add the new email
      } else if (action === 'unsubscribe') {
        const index = emails.indexOf(email);
        if (index !== -1) emails.splice(index, 1); // Remove the email
      }

      // Write updated emails back to S3 as line-separated values
      await s3
        .putObject({
          Bucket: bucketName,
          Key: emailFileKey,
          Body: emails.join('\n'), // Join emails with line breaks
          ContentType: 'text/plain',
        })
        .promise();

      return {
        statusCode: 200,
        body: `${action === 'subscribe' ? 'Subscribed' : 'Unsubscribed'} successfully.`,
      };
    } catch (error: any) {
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
