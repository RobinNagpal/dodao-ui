import AWS from 'aws-sdk';
import * as fs from "fs";
import * as path from "path";

const s3 = new AWS.S3({ region: 'us-east-1' });
const bucketName = process.env.AWS_BUCKET!;
const emailPath = process.env.AWS_BUCKET_EMAIL_PATH;
const emailFileKey = emailPath ? `${emailPath}/email-list.json` : 'email-list.json'

type RequestBody = {
  email?: string;
  action?: string;
  compound?: boolean;
  market?: boolean;
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
  const { email, action, compound, market } = body;

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
    if (!email || !action || compound === undefined || market === undefined) {
      return { statusCode: 400, body: 'Email, action, compound, and market are required.' };
    }

    try {
      let emailPreferences: Record<string, { compound: boolean; market: boolean }> = {};
      try {
        const file = await s3.getObject({ Bucket: bucketName, Key: emailFileKey }).promise();
        emailPreferences = JSON.parse(file.Body?.toString('utf-8') || "{}");
      } catch (error: any) {
        if (error.code !== 'NoSuchKey') {
          throw error;
        }
        console.log('No existing email file found, creating a new one.');
      }

      if (action === 'subscribe') {
        emailPreferences[email] = { compound, market };
        if (emailPreferences[email]) {
            return { statusCode: 400, body: 'You are already subscribed. Updating preferences...' };
        }
      } else if (action === 'unsubscribe') {
          if (!emailPreferences[email]) {
              return { statusCode: 404, body: 'Email not found. Cannot unsubscribe.' };
          }
          delete emailPreferences[email]; // Remove the user completely
      }


      // Write updated emails back to S3 as line-separated values
      await s3.putObject({
        Bucket: bucketName,
        Key: emailFileKey,
        Body: JSON.stringify(emailPreferences, null, 2),
        ContentType: 'application/json',
      }).promise();

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
