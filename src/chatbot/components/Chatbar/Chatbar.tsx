import { useCallback, useContext, useEffect } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/chatbot/hooks/useCreateReducer';

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/chatbot/utils/app/const';
import { saveConversation, saveConversations } from '@/chatbot/utils/app/conversation';
import { saveFolders } from '@/chatbot/utils/app/folders';
import { exportData, importData } from '@/chatbot/utils/app/importExport';

import { Conversation } from '@/chatbot/types/chat';
import { LatestExportFormat, SupportedExportFormats } from '@/chatbot/types/export';
import { OpenAIModels } from '@/chatbot/types/openai';
import { PluginKey } from '@/chatbot/types/plugin';

import HomeContext from '@/chatbot/home/home.context';

import { ChatbarSettings } from '@/chatbot/components/Chatbar/components/ChatbarSettings';
import { Conversations } from '@/chatbot/components/Chatbar/components/Conversations';

import Sidebar from '@/chatbot/components/Sidebar';
import ChatbarContext from '@/chatbot/components/Chatbar/Chatbar.context';
import { ChatbarInitialState, initialState } from '@/chatbot/components/Chatbar/Chatbar.state';

import { v4 as uuidv4 } from 'uuid';

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: { conversations, showChatbar, defaultModelId, folders, pluginKeys },
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey });

      localStorage.setItem('apiKey', apiKey);
    },
    [homeDispatch]
  );

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey;
        }

        return key;
      });

      homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys });

      localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
    } else {
      homeDispatch({ field: 'pluginKeys', value: [...pluginKeys, pluginKey] });

      localStorage.setItem('pluginKeys', JSON.stringify([...pluginKeys, pluginKey]));
    }
  };

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    const updatedPluginKeys = pluginKeys.filter((key) => key.pluginId !== pluginKey.pluginId);

    if (updatedPluginKeys.length === 0) {
      homeDispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
      return;
    }

    homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys });

    localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = importData(data);
    homeDispatch({ field: 'conversations', value: history });
    homeDispatch({
      field: 'selectedConversation',
      value: history[history.length - 1],
    });
    homeDispatch({ field: 'folders', value: folders });
    homeDispatch({ field: 'prompts', value: prompts });

    window.location.reload();
  };

  const handleClearConversations = () => {
    defaultModelId &&
      homeDispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });

    homeDispatch({ field: 'conversations', value: [] });

    localStorage.removeItem('conversationHistory_v2');
    localStorage.removeItem('selectedConversation_v2');

    const updatedFolders = folders.filter((f) => f.type !== 'chat');

    homeDispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter((c) => c.id !== conversation.id);

    homeDispatch({ field: 'conversations', value: updatedConversations });
    chatDispatch({ field: 'searchTerm', value: '' });
    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      homeDispatch({
        field: 'selectedConversation',
        value: updatedConversations[updatedConversations.length - 1],
      });

      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      defaultModelId &&
        homeDispatch({
          field: 'selectedConversation',
          value: {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            temperature: DEFAULT_TEMPERATURE,
            folderId: null,
          },
        });

      localStorage.removeItem('selectedConversation_v2');
    }
  };

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar });
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 });
      chatDispatch({ field: 'searchTerm', value: '' });
      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations.filter((conversation) => {
          const searchable = conversation.name.toLocaleLowerCase() + ' ' + conversation.messages.map((message) => message.userQuestion).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations,
      });
    }
  }, [searchTerm, conversations]);

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportData,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Conversation>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Conversations conversations={filteredConversations} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) => chatDispatch({ field: 'searchTerm', value: searchTerm })}
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
