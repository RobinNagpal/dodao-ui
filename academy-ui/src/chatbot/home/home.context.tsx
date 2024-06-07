import { Dispatch, createContext } from 'react';

import { ActionType } from '@/chatbot/hooks/useCreateReducer';

import { Conversation } from '@/chatbot/types/chat';
import { KeyValuePair } from '@/chatbot/types/data';
import { FolderType } from '@/chatbot/types/folder';

import { HomeInitialState } from './home.state';

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewConversation: () => void;
  handleCreateFolder: (name: string, type: FolderType) => void;
  handleDeleteFolder: (folderId: string) => void;
  handleUpdateFolder: (folderId: string, name: string) => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (conversation: Conversation, data: KeyValuePair) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
