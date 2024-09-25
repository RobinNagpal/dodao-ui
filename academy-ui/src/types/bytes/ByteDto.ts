import { ByteStepItem } from '@/types/stepItems/stepItemDto';

export enum ImageDisplayMode {
  FullScreenImage = 'FullScreenImage',
  Normal = 'Normal',
}

export interface ByteStepDto {
  content: string;
  displayMode?: ImageDisplayMode | null;
  name: string;
  uuid: string;
  imageUrl?: string | null;
  stepItems: Array<ByteStepItem>;
}

export interface CompletionScreenDto {
  content: string;
  name: string;
  uuid: string;
  imageUrl?: string | null;
  items: Array<CompletionScreenItem>;
}

export interface CompletionScreenItem {
  label: string;
  link: string;
  uuid: string;
}

export interface ByteDto {
  postSubmissionStepContent?: string;
  content: string;
  created: string;
  id: string;
  name: string;
  admins: Array<string>;
  tags: Array<string>;
  priority: number;
  videoUrl?: string | null;
  videoAspectRatio?: string | null;
  completionScreen?: CompletionScreenDto | null;
  steps: Array<ByteStepDto>;
}
