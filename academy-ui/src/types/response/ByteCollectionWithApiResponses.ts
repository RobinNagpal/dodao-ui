export interface CreateByteCollectionWithApiResponse {
  byteCollection: {
    id: string;
    name: string;
    description: string;
    byteIds: Array<string>;
  }
}
