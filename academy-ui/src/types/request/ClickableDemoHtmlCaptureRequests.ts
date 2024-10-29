import { ClickableDemoHtmlCaptureDto } from '@/types/html-captures/ClickableDemoHtmlCaptureDto';

export interface CreateClickableDemoHtmlCaptureRequest {
  input: {
    clickableDemoId: string;
    fileName: string;
    fileUrl: string;
    fileImageUrl: string;
    archive: boolean;
  };
}

export interface DeleteClickableDemoHtmlCaptureRequest {
  itemId: string;
  itemType: ClickableDemoHtmlCaptureDto;
}
