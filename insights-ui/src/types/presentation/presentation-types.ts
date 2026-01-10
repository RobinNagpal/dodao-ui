export type SlideType = 'title' | 'bullets' | 'paragraphs' | 'image';

export interface BaseSlide {
  id: string;
  type: SlideType;
  title: string;
  narration: string;
}

export interface TitleSlide extends BaseSlide {
  type: 'title';
  subtitle?: string;
}

export interface BulletsSlide extends BaseSlide {
  type: 'bullets';
  bullets: string[];
  titleAccent?: string;
  bulletAccents?: string[];
}

export interface ParagraphsSlide extends BaseSlide {
  type: 'paragraphs';
  paragraphs: string[];
  titleAccent?: string;
  paragraphAccents?: string[];
  footer?: string;
}

export interface ImageSlide extends BaseSlide {
  type: 'image';
  bullets: string[];
  imageUrl: string;
  titleAccent?: string;
  bulletAccents?: string[];
}

export type Slide = TitleSlide | BulletsSlide | ParagraphsSlide | ImageSlide;

export interface SlidePreference {
  slideNumber: string;
  slide: Slide;
}

export interface PresentationPreferences {
  presentationId: string;
  outputBucket: string;
  voice: string;
  slides: SlidePreference[];
}

// Render metadata for tracking renders
export interface RenderMetadata {
  slideNumber: string;
  bucketName: string;
  updatedAt: string;
  image?: {
    renderId: string;
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    url?: string;
    startedAt?: string;
    completedAt?: string;
  };
  video?: {
    renderId: string;
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    url?: string;
    duration?: number;
    startedAt?: string;
    completedAt?: string;
  };
}

// Slide status for display
export interface SlideStatus {
  slideNumber: string;
  slide?: Slide;
  hasText: boolean;
  hasImage: boolean;
  hasAudioScript: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  audioUrl?: string;
  imageUrl?: string;
  imageStatus?: 'pending' | 'rendering' | 'completed' | 'failed';
  imageRenderId?: string;
  videoUrl?: string;
  videoStatus?: 'pending' | 'rendering' | 'completed' | 'failed';
  videoRenderId?: string;
}

// Presentation status
export interface PresentationStatus {
  presentationId: string;
  hasPreferences: boolean;
  hasPrompt: boolean;
  hasGeneratedContent: boolean;
  slides: SlideStatus[];
  hasFinalVideo?: boolean;
  finalVideoUrl?: string;
  finalVideoLastModified?: number;
}

// Presentation summary for listing
export interface PresentationSummary {
  presentationId: string;
  createdAt?: string;
  slideCount?: number;
  hasPreferences: boolean;
}

// API request/response types
export interface SavePreferencesRequest {
  presentationId: string;
  outputBucket: string;
  voice: string;
  slides: SlidePreference[];
}

export interface GenerateFromPromptRequest {
  presentationId: string;
  prompt: string;
  numberOfSlides: number;
  additionalInstructions?: string;
  outputBucket: string;
  voice: string;
}

export interface GenerateSlideRequest {
  presentationId: string;
  slideNumber: string;
  outputBucket: string;
  voice?: string;
}

export interface RenderStatusRequest {
  renderId: string;
  bucketName: string;
}

export interface ConcatenateVideosRequest {
  videoUrls: string[];
  renderIds: string[];
  outputBucket: string;
  outputKey: string;
  presentationId: string;
}

// FFmpeg merger request
export interface FFmpegMergeRequest {
  clips: { s3Url: string; s3Key?: string }[];
  outputKey: string;
}

// API Request types
export interface CreatePresentationJsonRequest {
  mode: 'json';
  presentationId: string;
  voice: string;
  slides: Slide[];
}

export interface CreatePresentationPromptRequest {
  mode: 'prompt';
  presentationId: string;
  voice: string;
  prompt: string;
  numberOfSlides: number;
  additionalInstructions?: string;
}

export type CreatePresentationRequest = CreatePresentationJsonRequest | CreatePresentationPromptRequest;

// API Response types
export interface PresentationsListResponse {
  presentations: PresentationSummary[];
}

export interface CreatePresentationJsonResponse {
  success: true;
  presentationId: string;
  mode: 'json';
  slideCount: number;
  [key: string]: any; // For additional properties from lambda
}

export interface CreatePresentationPromptResponse {
  success: true;
  presentationId: string;
  mode: 'prompt';
  [key: string]: any; // For additional properties from lambda
}

export type CreatePresentationResponse = CreatePresentationJsonResponse | CreatePresentationPromptResponse;

// API Response types for presentation detail operations
export interface PresentationDetailResponse {
  presentationId: string;
  status: PresentationStatus;
  preferences: PresentationPreferences | null;
}

export interface UpdatePresentationResponse {
  success: true;
  presentationId: string;
  [key: string]: any; // For additional properties from lambda
}

export interface DeletePresentationResponse {
  success: boolean;
  presentationId: string;
}

export interface GenerateFinalVideoResponse {
  success: true;
  presentationId: string;
  outputKey: string;
  outputUrl: string;
  videoCount: number;
  [key: string]: any; // For additional properties
}

export interface RenderStatusResponse {
  presentationId: string;
  done?: boolean;
  overallProgress?: number;
  outputUrl?: string;
  outputFile?: string;
  [key: string]: any; // For additional properties from lambda
}

export interface GenerateArtifactResponse {
  success: true;
  action: string;
  presentationId: string;
  slideNumber: string;
  [key: string]: any; // For additional properties from lambda
}

export interface AddSlideResponse {
  success: true;
  presentationId: string;
  slideNumber: string;
  message: string;
}

export interface DeleteSlideResponse {
  success: true;
  presentationId: string;
  slideNumber: string;
  message: string;
}

export interface UploadImageResponse {
  success: true;
  presentationId: string;
  slideNumber: string;
  imageUrl: string;
  message: string;
}

// Available voices - AWS Polly Generative Engine (English US)
export const AVAILABLE_VOICES = [
  { id: 'Ruth', name: 'Ruth (US Female)', default: true },
  { id: 'Danielle', name: 'Danielle (US Female)' },
  { id: 'Joanna', name: 'Joanna (US Female)' },
  { id: 'Salli', name: 'Salli (US Female)' },
  { id: 'Matthew', name: 'Matthew (US Male)' },
  { id: 'Stephen', name: 'Stephen (US Male)' },
];

export const DEFAULT_VOICE = 'Ruth';
