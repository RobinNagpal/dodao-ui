// API Types for Lambda functions

// ==================== Slide Types ====================

export type SlideType = "title" | "bullets" | "paragraphs" | "image";

export interface SlideInput {
  id: string;
  type: SlideType;
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

// ==================== Path Structure ====================

/**
 * S3 Path Structure:
 * {presentation-id}/inputs/slide-and-script-preferences.json
 * {presentation-id}/inputs/prompt.txt (if generated from prompt)
 * {presentation-id}/middle/generated-slide-content-all.json
 * {presentation-id}/output/{slide-number}/generated-slide-text.json
 * {presentation-id}/output/{slide-number}/generated-slide-image.png
 * {presentation-id}/output/{slide-number}/generated-slide-audio-script.txt
 * {presentation-id}/output/{slide-number}/generated-slide-audio.mp3
 * {presentation-id}/output/{slide-number}/generated-slide-video.mp4
 * {presentation-id}/output/{slide-number}/render-metadata.json (tracks renderId, status)
 */

export interface PresentationPaths {
  presentationId: string;
  bucket: string;
  inputs: {
    preferences: string; // slide-and-script-preferences.json
    prompt: string; // prompt.txt (optional)
  };
  middle: {
    generatedContent: string; // generated-slide-content-all.json
  };
  output: (slideNumber: string) => SlideOutputPaths;
}

export interface SlideOutputPaths {
  text: string; // generated-slide-text.json
  image: string; // generated-slide-image.png
  audioScript: string; // generated-slide-audio-script.txt
  audio: string; // generated-slide-audio.mp3
  video: string; // generated-slide-video.mp4
  renderMetadata: string; // render-metadata.json
}

// ==================== User Inputs ====================

export interface SlidePreference {
  slideNumber: string; // "01", "02", etc.
  slide: SlideInput;
}

export interface SlideAndScriptPreferences {
  presentationId: string;
  slides: SlidePreference[];
  voice?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptInput {
  presentationId: string;
  prompt: string;
  additionalInstructions?: string;
  numberOfSlides?: number;
  voice?: string;
}

// ==================== Generated Content ====================

export interface GeneratedSlideContent {
  slideNumber: string;
  slide: SlideInput;
  generatedAt: string;
}

export interface GeneratedContentAll {
  presentationId: string;
  prompt: string;
  slides: GeneratedSlideContent[];
  generatedAt: string;
  model: string;
}

// ==================== Render Metadata ====================

/**
 * Tracks render IDs and actual S3 URLs for image and video
 * Note: Remotion Lambda stores outputs at renders/{renderId}/{outName}
 * So actual URLs are: https://bucket.s3.region.amazonaws.com/renders/{renderId}/{path}
 */
export interface RenderMetadata {
  slideNumber: string;
  bucketName: string;
  updatedAt: string;

  // Image render info
  image?: {
    renderId: string;
    status: "pending" | "rendering" | "completed" | "failed";
    url?: string; // Actual URL: renders/{renderId}/{presentationId}/output/{slideNumber}-slide/generated-slide-image.png
    startedAt: string;
    completedAt?: string;
    error?: string;
  };

  // Video render info
  video?: {
    renderId: string;
    status: "pending" | "rendering" | "completed" | "failed";
    url?: string; // Actual URL: renders/{renderId}/{presentationId}/output/{slideNumber}-slide/generated-slide-video.mp4
    duration?: number;
    startedAt: string;
    completedAt?: string;
    error?: string;
  };
}

// ==================== API Requests ====================

// Save preferences (manual slide content input)
export interface SavePreferencesRequest {
  presentationId: string;
  slides: SlidePreference[];
  voice?: string;
  outputBucket: string;
}

export interface SavePreferencesResponse {
  success: boolean;
  presentationId: string;
  preferencesUrl: string;
  slideCount: number;
  error?: string;
}

// Generate from prompt (AI generation)
export interface GenerateFromPromptRequest {
  presentationId: string;
  prompt: string;
  additionalInstructions?: string;
  numberOfSlides?: number;
  voice?: string;
  outputBucket: string;
}

export interface GenerateFromPromptResponse {
  success: boolean;
  presentationId: string;
  promptUrl: string;
  generatedContentUrl: string;
  slides: GeneratedSlideContent[];
  error?: string;
}

// Generate slide image
export interface GenerateSlideImageRequest {
  presentationId: string;
  slideNumber: string;
  outputBucket: string;
}

export interface GenerateSlideImageResponse {
  success: boolean;
  presentationId: string;
  slideNumber: string;
  textUrl: string;
  imageUrl: string;
  renderId?: string;
  error?: string;
}

// Generate slide audio
export interface GenerateSlideAudioRequest {
  presentationId: string;
  slideNumber: string;
  voice?: string;
  outputBucket: string;
}

export interface GenerateSlideAudioResponse {
  success: boolean;
  presentationId: string;
  slideNumber: string;
  audioScriptUrl: string;
  audioUrl: string; // Direct S3 URL for storage/display
  audioPresignedUrl?: string; // Presigned URL for immediate Remotion Lambda use
  duration: number;
  error?: string;
}

// Generate slide video
export interface GenerateSlideVideoRequest {
  slide: SlideInput;
  voice?: string;
  outputBucket: string;
  outputPrefix?: string;
  // New fields for presentation structure
  presentationId?: string;
  slideNumber?: string;
}

export interface GenerateSlideVideoResponse {
  success: boolean;
  slideId: string;
  audioUrl: string;
  videoUrl: string;
  duration: number;
  renderId: string;
  bucketName: string;
  // New fields
  presentationId?: string;
  slideNumber?: string;
  renderMetadataUrl?: string;
  error?: string;
}

// Get presentation status
export interface GetPresentationStatusRequest {
  presentationId: string;
  outputBucket: string;
}

export interface SlideStatus {
  slideNumber: string;
  hasText: boolean;
  hasImage: boolean;
  hasAudioScript: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  // Image render info
  imageStatus?: "pending" | "rendering" | "completed" | "failed";
  imageRenderId?: string;
  imageUrl?: string;
  // Video render info
  videoStatus?: "pending" | "rendering" | "completed" | "failed";
  videoRenderId?: string;
  videoUrl?: string;
}

export interface GetPresentationStatusResponse {
  success: boolean;
  presentationId: string;
  hasPreferences: boolean;
  hasPrompt: boolean;
  hasGeneratedContent: boolean;
  slides: SlideStatus[];
  error?: string;
}

// ==================== Concatenation ====================

export interface ConcatenateVideosRequest {
  videoUrls: string[];
  renderIds: string[];
  outputBucket: string;
  outputKey: string;
  transitionDuration?: number;
  // New fields
  presentationId?: string;
}

export interface ConcatenateVideosResponse {
  success: boolean;
  outputUrl: string;
  totalDuration: number;
  videoCount: number;
  renderId?: string;
  bucketName?: string;
  error?: string;
}

// ==================== Render Status ====================

export interface GetRenderStatusRequest {
  renderId: string;
  bucketName: string;
}

export interface GetRenderStatusResponse {
  success: boolean;
  renderId: string;
  done: boolean;
  overallProgress: number;
  outputFile?: string;
  outputUrl?: string;
  errors?: string[];
  currentStep?: string;
  error?: string;
}

// ==================== Legacy Types (for backward compatibility) ====================

export interface S3VideoMetadata {
  url: string;
  key: string;
  duration: number;
  size: number;
}
