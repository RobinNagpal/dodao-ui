import { OpenAIModel } from '@/chatbot/types/openai';
import { ChatbotFaqFragment } from '@/graphql/generated/generated-types';

// QuestionAsked --> FAQReceived --> FaqAndAnswerReceived
export enum ChatMessageState {
  QuestionAsked = 'question-asked',
  FAQReceived = 'faq-received',
  FaqAndAnswerReceived = 'faq-and-answer-received',
  Error = 'error',
}
export interface ConversationMessage {
  userQuestion: string;
  assistantResponse?: string;
  relatedFAQs?: ChatbotFaqFragment[];
  state: ChatMessageState;
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
