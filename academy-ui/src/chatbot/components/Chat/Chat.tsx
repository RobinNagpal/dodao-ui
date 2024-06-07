import { SpaceProps } from '@/app/withSpace';
import { ChatInput } from '@/chatbot/components/Chat/ChatInput';
import { ChatLoader } from '@/chatbot/components/Chat/ChatLoader';
import { ErrorMessageDiv } from '@/chatbot/components/Chat/ErrorMessageDiv';
import { MemoizedChatMessage } from '@/chatbot/components/Chat/MemoizedChatMessage';

import HomeContext from '@/chatbot/home/home.context';

import { Conversation, ConversationMessage } from '@/chatbot/types/chat';

import { saveConversation, saveConversations } from '@/chatbot/utils/app/conversation';
import { throttle } from '@/chatbot/utils/throttle/throttle';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useSearchChatbotFaQsQuery } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { IconArrowDown } from '@tabler/icons-react';

import { useTranslation } from 'next-i18next';
import React, { memo, MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './Chat.module.scss';

interface Props extends SpaceProps {
  stopConversationRef: MutableRefObject<boolean>;
  isChatbotSite: boolean;
}

export const Chat = memo(({ stopConversationRef, space, isChatbotSite }: Props) => {
  const { $t } = useI18();
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, conversations, models, pluginKeys, messageIsStreaming, modelError, loading, prompts },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<ConversationMessage>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { refetch: searchFAQs } = useSearchChatbotFaQsQuery({ skip: true });

  const [enacted, setEnacted] = useState<boolean>(true);
  const [discussed, setDiscussed] = useState<boolean>(true);

  const handleSend = useCallback(
    async (message: ConversationMessage, deleteCount = 0) => {
      if (selectedConversation) {
        const result = await searchFAQs({
          spaceId: space.id,
          query: message.userQuestion,
        });

        let updatedConversation: Conversation;

        message = { ...message, relatedFAQs: result.data?.searchChatbotFAQs?.filter((faq) => faq.score > 0.8) || [] };
        updatedConversation = {
          ...selectedConversation,
          messages: [message],
        };
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        const endpoint = 'https://api.openai.com/v1/engines/davinci/completions';
        const body = JSON.stringify({
          model: updatedConversation.model,
          messages: [{ role: 'user', content: message.userQuestion }],
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
          spaceId: space.id,
          enacted,
          discussed,
        });
        const controller = new AbortController();
        console.log('endpoint', endpoint);
        const response: Response = await fetch(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });

        console.log('response', response);
        if (!response.ok) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }

        if (updatedConversation.messages.length === 2) {
          const { userQuestion } = message;
          const customName = userQuestion.length > 30 ? userQuestion.toString().substring(0, 30) + '...' : userQuestion;
          updatedConversation = {
            ...updatedConversation,
            name: customName.toString(),
          };
        }
        homeDispatch({ field: 'loading', value: false });
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let isFirst = true;
        let text = '';
        while (!done) {
          if (stopConversationRef.current) {
            controller.abort();
            done = true;
            break;
          }
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          text += chunkValue;
          if (isFirst) {
            isFirst = false;
            const updatedMessages: ConversationMessage[] = [{ ...message, assistantResponse: chunkValue }];
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          } else {
            const updatedMessages: ConversationMessage[] = updatedConversation.messages.map((message, index): ConversationMessage => {
              if (index === updatedConversation.messages.length - 1) {
                return {
                  ...message,
                  assistantResponse: text,
                };
              }
              return message;
            });
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          }
        }
        saveConversation(updatedConversation);
        const updatedConversations: Conversation[] = conversations.map((conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation;
          }
          return conversation;
        });
        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation);
        }
        homeDispatch({ field: 'conversations', value: updatedConversations });
        saveConversations(updatedConversations);
        homeDispatch({ field: 'messageIsStreaming', value: false });
      }
    },
    [conversations, pluginKeys, selectedConversation, stopConversationRef]
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (confirm(t('Are you sure you want to clear all messages?')) && selectedConversation) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
  }, [throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      }
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  useEffect(() => {
    handleScrollDown();
  }, [currentMessage]);

  return (
    <div className="w-full">
      {isChatbotSite ? (
        <div className="p-2 w-full text-center flex justify-center" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
          <div className="max-w-7xl sm:px-2 lg:px-8" dangerouslySetInnerHTML={{ __html: $t(`chatbot.${space.id}.topBanner`) }} />
        </div>
      ) : null}
      <PageWrapper>
        <div className={`h-max w-full ${styles.chatWrapperDiv}`}>
          {modelError ? (
            <ErrorMessageDiv error={modelError} />
          ) : (
            <div className="flex flex-col w-full">
              <div className="flex justify-end">
                <div>
                  <div className="text-base">Filters</div>
                  <div className="text-xs mb-4 mt-1">Relevant for information from forums</div>
                  <ToggleWithIcon label={'Enacted (Decision Taken?)'} enabled={enacted} setEnabled={(value) => setEnacted(value)} />
                  <ToggleWithIcon label={'Discussed'} enabled={discussed} setEnabled={(value) => setDiscussed(value)} />
                </div>
              </div>
              <div className="overflow-scroll flex-1 w-full" ref={chatContainerRef} onScroll={handleScroll}>
                <div className={styles.chatMessagesDiv}>
                  {!selectedConversation?.messages?.length ? (
                    <h1 className="pt-36  mt-36 h-full align-center w-full text-center text-xl">Ask your question to AI Chatbot by typing in the box below</h1>
                  ) : null}

                  {selectedConversation?.messages.map((message, index) => (
                    <MemoizedChatMessage
                      key={index}
                      message={message}
                      messageIndex={index}
                      onEdit={(editedMessage: ConversationMessage) => {
                        setCurrentMessage(editedMessage);
                        // discard edited message and the ones that come after then resend
                        handleSend(editedMessage, selectedConversation?.messages.length - index);
                      }}
                      onScrollDownClick={handleScrollDown}
                    />
                  ))}

                  {loading && <ChatLoader />}

                  <div className="h-[162px]" ref={messagesEndRef} />
                </div>
              </div>
              {showScrollDownButton && (selectedConversation?.messages.length || 0) > 0 && (
                <div className="w-full mt-4">
                  <button
                    className={`float-right h-7 w-7 items-center justify-center rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500  ${styles.scrollDownButton}`}
                    onClick={handleScrollDown}
                  >
                    <IconArrowDown size={18} />
                  </button>
                </div>
              )}

              <ChatInput
                stopConversationRef={stopConversationRef}
                textareaRef={textareaRef}
                onSend={(message: ConversationMessage) => {
                  setCurrentMessage(message);
                  handleSend(message, 0);
                }}
                onRegenerate={() => {
                  if (currentMessage) {
                    handleSend(currentMessage, 2);
                  }
                }}
              />
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
});
Chat.displayName = 'Chat';
