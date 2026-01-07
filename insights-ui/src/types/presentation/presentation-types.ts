// Slide types matching API.md specification
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

// Available voices
export const AVAILABLE_VOICES = [
  { id: 'en-US-JennyNeural', name: 'Jenny (US Female)', default: true },
  { id: 'en-US-GuyNeural', name: 'Guy (US Male)' },
  { id: 'en-US-AriaNeural', name: 'Aria (US Female)' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (British Female)' },
];

export const DEFAULT_VOICE = 'en-US-JennyNeural';

