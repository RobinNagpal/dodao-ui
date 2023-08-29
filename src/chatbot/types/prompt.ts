import { OpenAIModel } from '@/chatbot/types/openai';

export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  model: OpenAIModel;
  folderId: string | null;
}
