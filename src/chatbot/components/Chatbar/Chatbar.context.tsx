import { Dispatch, createContext } from 'react';

import { ActionType } from '@/chatbot/hooks/useCreateReducer';

import { Conversation } from '@/chatbot/types/chat';
import { SupportedExportFormats } from '@/chatbot/types/export';
import { PluginKey } from '@/chatbot/types/plugin';

import { ChatbarInitialState } from '@/chatbot/components/Chatbar/Chatbar.state';

export interface ChatbarContextProps {
  state: ChatbarInitialState;
  dispatch: Dispatch<ActionType<ChatbarInitialState>>;
  handleDeleteConversation: (conversation: Conversation) => void;
  handleClearConversations: () => void;
  handleExportData: () => void;
  handleImportConversations: (data: SupportedExportFormats) => void;
  handlePluginKeyChange: (pluginKey: PluginKey) => void;
  handleClearPluginKey: (pluginKey: PluginKey) => void;
  handleApiKeyChange: (apiKey: string) => void;
}

const ChatbarContext = createContext<ChatbarContextProps>(undefined!);

export default ChatbarContext;
