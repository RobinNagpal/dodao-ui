import { ChartUrls } from '@/scripts/industry-tariff-reports/tariff-types';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import OpenAI from 'openai';

const REGION = process.env.AWS_REGION!;
const BUCKET_NAME = process.env.TARIFF_CHARTS_BUCKET!;
const s3Client = new S3Client({ region: REGION });

export function getChartPrompt(content: string) {
  return (
    '' +
    `
Create two charts focusing  on the effects of tariffs. Follow the following rules for charts
- Within the graph add a 2-3 line "Caption" explaining what this graph is.
- Below the graph and above the "Caption", explain each label in detail. Add one line for each label 
-  The labels should not overlap one another. 
- Allocate ~25-35% of the height of the full graph just for the information i.e. the label information and the Caption. 
- Insert line breaks in label description and Caption if they are too long and wont fit in one line easily.
- Use the relevant type of chart for showing the information 
- The charts should be black theme based and the colors should be some shades of "#4F46E5" color. 

Here is the content from which you need to create the charts:
${content}
`
  );
}

const openai = new OpenAI();

async function getAndWriteFile(fileId: string) {
  const response = await openai.files.content(fileId);

  // Extract the binary data from the Response object
  const image_data = await response.arrayBuffer();

  // Convert the binary data to a Buffer
  const image_data_buffer = Buffer.from(image_data);

  // Save the image to a specific location
  fs.writeFileSync('./my-image.png', image_data_buffer);
}

async function getAssistantResponse() {
  const thread = await openai.beta.threads.create({});

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: 'I need to solve the equation `3x + 11 = 14`. Can you help me?',
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: 'asst_by7aoh8aLHgXfoWWbcKepNUE',
    instructions: 'Please address the user as Jane Doe. The user has a premium account.',
  });

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    for (const message of messages.data.reverse()) {
      if (message.role === 'assistant' && message.content[0].type === 'image_file') {
        // get file id from the message
        const fileId = message.content[0].image_file.file_id;
      }
    }
  } else {
    console.log(run.status);
  }
}
getAndWriteFile('file-abc123');

/**
 * One‑shot helper – given raw *content* (serialised JSON / markdown / text),
 * create `n` images with the global getChartPrompt() rules and upload them to
 * the charts bucket. Returns an array of S3 URLs.
 */
export async function generateChartUrls(content: string, s3Prefix: string, n = 2): Promise<ChartUrls> {
  const promptText = getChartPrompt(content);

  const { data } = {} as any;

  const urls: string[] = [];
  let idx = 0;
  for (const { url } of data) {
    const res = await fetch(url!);
    const arrayBuffer = await res.arrayBuffer();
    const key = `${s3Prefix}/chart-${idx++}.png`;
    const s3Url = await uploadImageToS3(new Uint8Array(arrayBuffer), key);
    urls.push(s3Url);
  }
  return [];
}

export async function uploadImageToS3(data: Uint8Array, key: string, contentType = 'image/png'): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

export const img = (urls?: ChartUrls) => (urls ?? []).map((u) => `![chart](${u})`).join('\n\n');
