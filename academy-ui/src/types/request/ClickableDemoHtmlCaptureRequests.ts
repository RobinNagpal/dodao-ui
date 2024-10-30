export interface CreateClickableDemoHtmlCaptureRequest {
  input: {
    clickableDemoId: string;
    fileName: string;
    fileUrl: string;
    fileImageUrl: string;
    archive: boolean;
  };
}
