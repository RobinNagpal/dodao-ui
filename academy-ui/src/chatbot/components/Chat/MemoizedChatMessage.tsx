import { FC, memo } from 'react';
import { ChatMessage, Props } from '@/chatbot/components/Chat/ChatMessage';

export const MemoizedChatMessage: FC<Props> = memo(
  ChatMessage,
  (prevProps, nextProps) => prevProps.message.assistantResponse === nextProps.message.assistantResponse
);
