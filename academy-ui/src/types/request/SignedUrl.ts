export interface CreateSignedUrlRequestInput {
  name: string;
  imageType: string;
  objectId: string;
  contentType: string;
}

export interface CreateSignedUrlRequest {
  input: CreateSignedUrlRequestInput;
  spaceId: string;
}
