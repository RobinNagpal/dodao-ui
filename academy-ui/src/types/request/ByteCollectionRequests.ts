export interface CreateByteCollectionRequest {
  name: string;
  description: string;
  priority?: number;
  videoUrl?: string | null;
}
