import { SpaceProps } from '@/app/withSpace';
import { ChatInput } from '@/chatbot/components/Chat/ChatInput';
import { ChatLoader } from '@/chatbot/components/Chat/ChatLoader';
import { ErrorMessageDiv } from '@/chatbot/components/Chat/ErrorMessageDiv';
import { MemoizedChatMessage } from '@/chatbot/components/Chat/MemoizedChatMessage';

import HomeContext from '@/chatbot/home/home.context';

import { ChatBody, Conversation, Message } from '@/chatbot/types/chat';
import { Plugin } from '@/chatbot/types/plugin';

import { saveConversation, saveConversations, updateConversation } from '@/chatbot/utils/app/conversation';
import { throttle } from '@/chatbot/utils/throttle/throttle';
import Button from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import { IconArrowDown } from '@tabler/icons-react';

import { useTranslation } from 'next-i18next';
import React, { memo, MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './Chat.module.scss';

interface Props extends SpaceProps {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef, space }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, conversations, models, pluginKeys, messageIsStreaming, modelError, loading, prompts },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;

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
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: updatedConversation.messages,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
          spaceId: space.id,
        };
        const endpoint = 'https://api.openai.com/v1/engines/davinci/completions';
        let body;
        if (!plugin) {
          body = JSON.stringify(chatBody);
        } else {
          body = JSON.stringify({
            ...chatBody,
          });
        }
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
        if (!plugin) {
          if (updatedConversation.messages.length === 1) {
            const { content } = message;
            const customName = content.length > 30 ? content.substring(0, 30) + '...' : content;
            updatedConversation = {
              ...updatedConversation,
              name: customName,
            };
          }
          homeDispatch({ field: 'loading', value: false });
          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let isFirst = true;
          let text = '';
          while (!done) {
            if (stopConversationRef.current === true) {
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
              const updatedMessages: Message[] = [...updatedConversation.messages, { role: 'assistant', content: chunkValue }];
              updatedConversation = {
                ...updatedConversation,
                messages: updatedMessages,
              };
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
            } else {
              const updatedMessages: Message[] = updatedConversation.messages.map((message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...message,
                    content: text,
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
        } else {
          const { answer } = await response.json();
          const updatedMessages: Message[] = [...updatedConversation.messages, { role: 'assistant', content: answer }];
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
          homeDispatch({
            field: 'selectedConversation',
            value: updateConversation,
          });
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
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
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
    selectedConversation && setCurrentMessage(selectedConversation.messages[selectedConversation.messages.length - 2]);
  }, [selectedConversation, throttledScrollDown]);

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
    <PageWrapper>
      <div className={`h-max w-full ${styles.chatWrapperDiv}`}>
        {modelError ? (
          <ErrorMessageDiv error={modelError} />
        ) : (
          <div className="flex flex-col w-full">
            <div className="overflow-scroll flex-1 w-full" ref={chatContainerRef} onScroll={handleScroll}>
              <div className={styles.chatMessagesDiv}>
                {!selectedConversation?.messages?.length ? (
                  <h1 className="align-center w-full text-center text-xl">Ask your question to Nema AI Chatbot by typing in the box below</h1>
                ) : null}

                {selectedConversation?.messages.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage: Message) => {
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
              onSend={(message, plugin) => {
                setCurrentMessage(message);
                handleSend(message, 0, plugin);
              }}
              onRegenerate={() => {
                if (currentMessage) {
                  handleSend(currentMessage, 2, null);
                }
              }}
            />
          </div>
        )}
      </div>
    </PageWrapper>
  );
});
Chat.displayName = 'Chat';
