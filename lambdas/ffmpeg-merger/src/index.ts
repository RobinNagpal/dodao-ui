import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { MergeRequest, MergeResponse, MergeResult } from './types';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';
const TMP_DIR = '/tmp';

/**
 * Download a file from S3 to local filesystem
 */
async function downloadFromS3(s3Key: string, localPath: string): Promise<void> {
  console.log(`Downloading ${s3Key} from S3...`);
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('No body in S3 response');
  }

  const stream = response.Body as Readable;
  const fileStream = fs.createWriteStream(localPath);

  return new Promise((resolve, reject) => {
    stream.pipe(fileStream);
    stream.on('error', reject);
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
}

/**
 * Upload a file from local filesystem to S3
 */
async function uploadToS3(localPath: string, s3Key: string): Promise<string> {
  console.log(`Uploading to S3: ${s3Key}...`);
  
  const fileContent = fs.readFileSync(localPath);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: 'video/mp4',
  });

  await s3Client.send(command);
  
  return `s3://${BUCKET_NAME}/${s3Key}`;
}

/**
 * Extract S3 key from S3 URL
 */
function extractS3Key(s3Url: string): string {
  // Support formats: s3://bucket/key or https://bucket.s3.region.amazonaws.com/key
  if (s3Url.startsWith('s3://')) {
    const parts = s3Url.replace('s3://', '').split('/');
    parts.shift(); // Remove bucket name
    return parts.join('/');
  } else if (s3Url.includes('.s3.') || s3Url.includes('.s3-')) {
    const url = new URL(s3Url);
    return url.pathname.substring(1); // Remove leading slash
  }
  
  // Assume it's already a key
  return s3Url;
}


/**
 * Merge multiple video clips using FFmpeg concat demuxer with stream copy
 */
function mergeVideosWithStreamCopy(inputPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Merging ${inputPaths.length} videos with stream copy (no re-encoding)...`);
    
    // Create concat file
    const concatFilePath = path.join(TMP_DIR, 'concat.txt');
    const concatContent = inputPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatFilePath, concatContent);
    
    console.log(`Concat file content:\n${concatContent}`);

    // Try stream copy first for maximum speed
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFilePath,
      '-c', 'copy',  // Stream copy - no re-encoding!
      '-avoid_negative_ts', 'make_zero',
      '-y',
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log(`FFmpeg: ${data.toString()}`);
    });

    ffmpeg.on('close', (code) => {
      // Clean up concat file
      try {
        fs.unlinkSync(concatFilePath);
      } catch (e) {
        console.warn('Failed to clean up concat file:', e);
      }

      if (code === 0) {
        console.log('Successfully merged videos with stream copy');
        resolve();
      } else {
        console.error(`Stream copy failed: ${stderr}`);
        console.log('Falling back to re-encoding...');
        // Fall back to re-encoding
        mergeVideosWithReencoding(inputPaths, outputPath).then(resolve).catch(reject);
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Merge multiple video clips using FFmpeg with re-encoding (fallback)
 */
function mergeVideosWithReencoding(inputPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Merging ${inputPaths.length} videos with re-encoding...`);
    
    // Create concat file
    const concatFilePath = path.join(TMP_DIR, 'concat.txt');
    const concatContent = inputPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatFilePath, concatContent);

    // Re-encode with fast settings
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFilePath,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y',
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log(`FFmpeg: ${data.toString()}`);
    });

    ffmpeg.on('close', (code) => {
      // Clean up concat file
      try {
        fs.unlinkSync(concatFilePath);
      } catch (e) {
        console.warn('Failed to clean up concat file:', e);
      }

      if (code === 0) {
        console.log('Successfully merged videos with re-encoding');
        resolve();
      } else {
        console.error(`FFmpeg error: ${stderr}`);
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main Lambda handler
 */
export async function handler(event: MergeRequest): Promise<MergeResponse> {
  const startTime = Date.now();
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const clips = event.clips || [];
  const outputKey = event.outputKey || `merged/output-${Date.now()}.mp4`;

  if (!clips || clips.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'No clips provided',
      }),
    };
  }

  const tempFiles: string[] = [];

  try {
    // Step 1: Download all clips from S3
    const downloadedPaths: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const s3Key = clip.s3Key || extractS3Key(clip.s3Url);
      const localPath = path.join(TMP_DIR, `clip-${i}-${path.basename(s3Key)}`);
      
      await downloadFromS3(s3Key, localPath);
      downloadedPaths.push(localPath);
      tempFiles.push(localPath);
    }

    // Step 2: Use downloaded videos directly (no padding needed - Remotion clips have built-in padding)
    console.log('Using videos directly for maximum speed - no padding processing needed!');
    const videoPaths = downloadedPaths;

    // Step 3: Merge all padded clips
    const mergedPath = path.join(TMP_DIR, 'merged-output.mp4');
    tempFiles.push(mergedPath);
    
    await mergeVideosWithStreamCopy(videoPaths, mergedPath);

    // Step 4: Upload merged video to S3
    const s3Url = await uploadToS3(mergedPath, outputKey);

    const duration = Date.now() - startTime;
    console.log(`Video merge completed successfully in ${duration}ms`);

    const result: MergeResult = {
      success: true,
      outputKey,
      s3Url,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Error during video merge:', error);
    
    const result: MergeResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };

    return {
      statusCode: 500,
      body: JSON.stringify(result),
    };

  } finally {
    // Clean up all temporary files
    console.log('Cleaning up temporary files...');
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`Deleted: ${file}`);
        }
      } catch (e) {
        console.warn(`Failed to delete ${file}:`, e);
      }
    }
  }
}

