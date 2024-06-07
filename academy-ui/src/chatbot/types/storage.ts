import { Conversation } from '@/chatbot/types/chat';
import { FolderInterface } from '@/chatbot/types/folder';
import { PluginKey } from '@/chatbot/types/plugin';
import { Prompt } from '@/chatbot/types/prompt';

// keep track of local storage schema
export interface LocalStorage {
  apiKey: string;
  conversationHistory: Conversation[];
  selectedConversation: Conversation;
  theme: 'light' | 'dark';
  // added folders (3/23/23)
  folders: FolderInterface[];
  // added prompts (3/26/23)
  prompts: Prompt[];
  // added showChatbar and showPromptbar (3/26/23)
  showChatbar: boolean;
  showPromptbar: boolean;
  // added plugin keys (4/3/23)
  pluginKeys: PluginKey[];
}
