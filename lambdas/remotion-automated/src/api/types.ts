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
  videoUrl: string; // S3 URL of generated video
  duration: number; // Duration in seconds
  error?: string;
}

export interface ConcatenateVideosRequest {
  videoUrls: string[]; // Array of S3 URLs or keys
  outputBucket: string;
  outputKey: string; // Final video S3 key (e.g., "final-videos/project-123.mp4")
  transitionDuration?: number; // Frames for transitions (default: 0)
}

export interface ConcatenateVideosResponse {
  success: boolean;
  outputUrl: string; // S3 URL of concatenated video
  totalDuration: number; // Total duration in seconds
  videoCount: number;
  error?: string;
}

export interface S3VideoMetadata {
  url: string;
  key: string;
  duration: number;
  size: number;
}
