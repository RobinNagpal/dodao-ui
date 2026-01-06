export interface VideoClip {
  s3Url: string;
  s3Key?: string;
}

export interface MergeRequest {
  clips: VideoClip[];
  outputKey?: string;
  paddingSeconds?: number;
}

export interface MergeResponse {
  statusCode: number;
  body: string;
}

export interface MergeResult {
  success: boolean;
  outputKey?: string;
  s3Url?: string;
  error?: string;
}

