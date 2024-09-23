export interface CreateClickableDemoHtmlCaptureResponse {
  capture: {
    id: string;
    clickableDemoId: string;
    fileName: string;
    fileUrl: string;
    fileImageUrl: string;
    createdAt: Date;
  };
}
