import { ClickableDemoStepDto } from '@/types/clickableDemos/ClickableDemoDto';

export interface CreateClickableDemoRequest {
  input: {
    title: string;
    excerpt: string;
    steps: Array<ClickableDemoStepDto>;
  };
  byteCollectionId: string;
}
export interface DeleteClickableDemoRequest {
  demoId: string;
  spaceId: string;
}
