/**
 * Example: Call FFmpeg Merger Lambda from Node.js application
 * 
 * Install: npm install @aws-sdk/client-lambda
 */

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambdaClient = new LambdaClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function mergeVideos(clips, outputKey = null, paddingSeconds = 1) {
  const payload = {
    clips: clips.map(url => ({ s3Url: url })),
    outputKey: outputKey || `merged/output-${Date.now()}.mp4`,
    paddingSeconds,
  };

  console.log('Invoking Lambda function...');
  console.log('Payload:', JSON.stringify(payload, null, 2));

  const command = new InvokeCommand({
    FunctionName: 'ffmpeg-video-merger',
    Payload: JSON.stringify(payload),
  });

  const response = await lambdaClient.send(command);
  const result = JSON.parse(Buffer.from(response.Payload).toString());
  const body = JSON.parse(result.body);

  return body;
}

// Example usage
async function main() {
  try {
    const result = await mergeVideos([
      's3://remotionlambda-useast1-ele686axd8/videos/clip1.mp4',
      's3://remotionlambda-useast1-ele686axd8/videos/clip2.mp4',
      's3://remotionlambda-useast1-ele686axd8/videos/clip3.mp4',
    ], 'merged/my-final-video.mp4', 1);

    console.log('Success!');
    console.log('Output:', result);
    console.log('Download from:', result.s3Url);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

