export interface CreateByteCollectionRequest {
  name: string;
  description: string;
  priority?: number;
  videoUrl?: string | null;
}

export interface UpdateByteCollectionRequest {
  id: string;
  name: string;
  description: string;
  priority?: number;
  videoUrl?: string | null;
}
