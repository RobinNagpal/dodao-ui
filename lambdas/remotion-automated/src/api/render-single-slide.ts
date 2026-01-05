// Single Slide Rendering Service
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import path from "node:path";
import fs from "node:fs";
import type { SlideInput, GenerateSlideVideoResponse } from "./types";
import { S3Helper } from "./s3-helper";
import { generateAudioToS3 } from "./tts-service";
import { getTempDir, ensureDir, isLambdaEnvironment } from "./utils";

/**
 * Render a single slide to video and upload to S3
 */
export async function renderSingleSlide(
  slide: SlideInput,
  outputBucket: string,
  outputPrefix: string = "",
  voice: string = "en-US-JennyNeural"
): Promise<GenerateSlideVideoResponse> {
  try {
    console.log(`Starting render for slide ${slide.id}...`);

    // Step 1: Generate audio and upload to S3
    const { audioUrl, localPath: audioPath } = await generateAudioToS3(
      slide.id,
      slide.narration,
      outputBucket,
      outputPrefix,
      voice
    );

    // Step 2: Get accurate audio duration using parseMedia
    const { durationInSeconds } = await parseMedia({
      src: audioPath,
      fields: { durationInSeconds: true },
      reader: nodeReader,
      acknowledgeRemotionLicense: true,
    });

    const audioDuration = durationInSeconds ?? 0;
    const fps = 30;
    const durationInFrames = Math.ceil(audioDuration * fps) + 5; // Add 5 frames padding

    console.log(`Audio duration: ${audioDuration}s, frames: ${durationInFrames}`);

    // Step 2.5: Copy audio to public folder so Remotion can serve it
    // In Lambda, we'll use /tmp for everything; locally we use public folder
    let publicAudioPath: string;
    let audioUrlForRemotion: string;

    if (isLambdaEnvironment()) {
      // In Lambda, keep audio in /tmp (no public folder available)
      publicAudioPath = audioPath;
      audioUrlForRemotion = audioPath; // Use file:// URL in Lambda
    } else {
      // Local development: copy to public folder
      const publicAudioDir = path.join(process.cwd(), "public", "audio");
      ensureDir(publicAudioDir);
      publicAudioPath = path.join(publicAudioDir, `${slide.id}.mp3`);
      fs.copyFileSync(audioPath, publicAudioPath);
      audioUrlForRemotion = `audio/${slide.id}.mp3`; // Relative path for staticFile
      console.log(`Audio copied to public folder: ${publicAudioPath}`);
    }

    // Step 3: Bundle the Remotion project
    console.log("Bundling Remotion project...");
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), "src", "index.ts"),
      webpackOverride: (config) => config,
    });

    // Step 4: Create composition for single slide
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "SingleSlide",
      inputProps: {
        slide,
        audioUrl: audioUrlForRemotion, // Use public folder path
      },
    });

    // Step 5: Render video to temporary file
    const tmpDir = path.join(getTempDir(), "videos");
    ensureDir(tmpDir);
    const outputPath = path.join(tmpDir, `${slide.id}.mp4`);

    console.log(`Rendering video for slide ${slide.id}...`);
    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        fps,
        width: 1920,
        height: 1080,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        slide,
        audioUrl: audioUrlForRemotion,
      },
      chromiumOptions: {
        gl: isLambdaEnvironment() ? "swiftshader" : "angle", // Use swiftshader in Lambda
        headless: true,
      },
      concurrency: 4, // Conservative for Lambda
      imageFormat: "jpeg",
      pixelFormat: "yuv420p",
      videoBitrate: "4M",
    });

    console.log(`Video rendered: ${outputPath}`);

    // Step 6: Upload video to S3
    const s3Helper = new S3Helper();
    const videoKey = `${outputPrefix}videos/${slide.id}.mp4`;
    const videoUrl = await s3Helper.uploadFile(outputBucket, videoKey, outputPath, "video/mp4");

    // Step 7: Cleanup temporary files
    try {
      fs.unlinkSync(audioPath); // Remove temp audio
      if (!isLambdaEnvironment() && publicAudioPath !== audioPath) {
        fs.unlinkSync(publicAudioPath); // Remove public audio (local only)
      }
      fs.unlinkSync(outputPath); // Remove temp video
    } catch (err) {
      console.warn("Failed to cleanup temp files:", err);
    }

    console.log(`Slide ${slide.id} completed successfully!`);

    return {
      success: true,
      slideId: slide.id,
      audioUrl,
      videoUrl,
      duration: audioDuration,
    };
  } catch (error) {
    console.error(`Error rendering slide ${slide.id}:`, error);
    return {
      success: false,
      slideId: slide.id,
      audioUrl: "",
      videoUrl: "",
      duration: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
