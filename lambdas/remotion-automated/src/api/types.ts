// API Types for Lambda functions

export interface SlideInput {
  id: string;
  type: "title" | "bullets" | "paragraphs" | "image";
  title?: string;
  subtitle?: string;
  titleAccent?: string;
  bullets?: string[];
  bulletAccents?: string[];
  paragraphs?: string[];
  paragraphAccents?: string[];
  footer?: string;
  imageUrl?: string;
  narration: string;
}

export interface GenerateSlideVideoRequest {
  slide: SlideInput;
  voice?: string; // TTS voice (default: en-US-JennyNeural)
  outputBucket: string; // S3 bucket name
  outputPrefix?: string; // S3 prefix/folder (e.g., "videos/project-123/")
}

export interface GenerateSlideVideoResponse {
  success: boolean;
  slideId: string;
  audioUrl: string; // S3 URL of generated audio
  videoUrl: string; // S3 URL of generated video (final location, may not exist yet)
  duration: number; // Duration in seconds
  renderId: string; // Remotion render ID for checking status
  bucketName: string; // S3 bucket where video will be stored
  error?: string;
}

export interface ConcatenateVideosRequest {
  videoUrls: string[]; // Array of S3 URLs or keys
  renderIds: string[]; // Array of render IDs (same order as videoUrls) - used to fetch video durations from progress.json
  outputBucket: string;
  outputKey: string; // Final video S3 key (e.g., "final-videos/project-123.mp4")
  transitionDuration?: number; // Frames for transitions (default: 0)
}

export interface ConcatenateVideosResponse {
  success: boolean;
  outputUrl: string; // S3 URL of concatenated video
  totalDuration: number; // Total duration in seconds
  videoCount: number;
  renderId?: string; // Remotion render ID when using async
  bucketName?: string; // Bucket name when using async
  error?: string;
}

export interface S3VideoMetadata {
  url: string;
  key: string;
  duration: number;
  size: number;
}

export interface GetRenderStatusRequest {
  renderId: string;
  bucketName: string;
}

export interface GetRenderStatusResponse {
  success: boolean;
  renderId: string;
  done: boolean;
  overallProgress: number; // 0-1
  outputFile?: string; // S3 key when done
  outputUrl?: string; // Full S3 URL when done
  errors?: string[];
  currentStep?: string;
  error?: string;
}
