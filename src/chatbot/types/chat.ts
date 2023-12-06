import { OpenAIModel } from '@/chatbot/types/openai';
import { SearchedChatbotFaqFragmentFragment } from '@/graphql/generated/generated-types';

export interface ConversationMessage {
  userQuestion: string;
  assistantResponse?: string;
  relatedFAQs?: SearchedChatbotFaqFragmentFragment[];
}
export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  prompt: string;
  temperature: number;
  spaceId: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: ConversationMessage[];
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  folderId: string | null;
}
