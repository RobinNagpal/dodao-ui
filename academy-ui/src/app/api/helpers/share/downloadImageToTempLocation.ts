import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

export default async function downloadImageToTempLocation(url: string): Promise<string> {
  try {
    // Axios call to the URL for the image file
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    // Create a unique filename
    const filename = path.basename(url);
    const tmpFilePath = path.join(os.tmpdir(), filename);

    // Create a write stream to the temporary file path
    const writer = fs.createWriteStream(tmpFilePath);

    // Pipe the response data to the writer
    response.data.pipe(writer);

    // Listen for 'finish' event to know when the write is complete
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return tmpFilePath;
  } catch (error) {
    console.error(`Failed to download image. Error: ${error}`);
    throw error;
  }
}
