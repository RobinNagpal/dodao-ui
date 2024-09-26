import { ClickableDemoStep } from '@/graphql/generated/generated-types';

export interface CreateClickableDemoRequest {
  input: {
    title: string;
    excerpt: string;
    steps: Array<ClickableDemoStep>;
  };
  byteCollectionId: string;
}
export interface DeleteClickableDemoRequest {
  demoId: string;
  spaceId: string;
}
