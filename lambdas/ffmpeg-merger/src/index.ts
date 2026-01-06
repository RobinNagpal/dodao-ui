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
 * Add padding to a video clip using FFmpeg
 */
function addPaddingToVideo(inputPath: string, outputPath: string, paddingSeconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Adding ${paddingSeconds}s padding to ${inputPath}...`);
    
    // Create a black frame with the same dimensions as the video
    // We'll use tpad filter to add padding at the end
    const args = [
      '-i', inputPath,
      '-vf', `tpad=stop_mode=clone:stop_duration=${paddingSeconds}`,
      '-af', `apad=pad_dur=${paddingSeconds}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-c:a', 'aac',
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
      if (code === 0) {
        console.log(`Successfully added padding to ${inputPath}`);
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
 * Merge multiple video clips using FFmpeg concat demuxer
 */
function mergeVideos(inputPaths: string[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Merging ${inputPaths.length} videos...`);
    
    // Create concat file
    const concatFilePath = path.join(TMP_DIR, 'concat.txt');
    const concatContent = inputPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatFilePath, concatContent);
    
    console.log(`Concat file content:\n${concatContent}`);

    // Use concat demuxer for fast concatenation without re-encoding
    // But we need to re-encode to ensure compatibility
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFilePath,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-c:a', 'aac',
      '-strict', 'experimental',
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
        console.log('Successfully merged videos');
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
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const clips = event.clips || [];
  const paddingSeconds = event.paddingSeconds || 1;
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

    // Step 2: Add padding to each clip
    const paddedPaths: string[] = [];
    for (let i = 0; i < downloadedPaths.length; i++) {
      const inputPath = downloadedPaths[i];
      const paddedPath = path.join(TMP_DIR, `padded-${i}.mp4`);
      
      await addPaddingToVideo(inputPath, paddedPath, paddingSeconds);
      paddedPaths.push(paddedPath);
      tempFiles.push(paddedPath);
    }

    // Step 3: Merge all padded clips
    const mergedPath = path.join(TMP_DIR, 'merged-output.mp4');
    tempFiles.push(mergedPath);
    
    await mergeVideos(paddedPaths, mergedPath);

    // Step 4: Upload merged video to S3
    const s3Url = await uploadToS3(mergedPath, outputKey);

    console.log('Video merge completed successfully');

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

