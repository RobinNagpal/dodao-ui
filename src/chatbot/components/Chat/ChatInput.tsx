import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { IconArrowDown, IconBolt, IconBrandGoogle, IconPlayerStop, IconRepeat, IconSend } from '@tabler/icons-react';
import React, { KeyboardEvent, MutableRefObject, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Message } from '@/chatbot/types/chat';
import { Plugin } from '@/chatbot/types/plugin';
import { Prompt } from '@/chatbot/types/prompt';

import HomeContext from '@/chatbot/home/home.context';

import { PluginSelect } from '@/chatbot/components/Chat/PluginSelect';
import { PromptList } from '@/chatbot/components/Chat/PromptList';
import { VariableModal } from '@/chatbot/components/Chat/VariableModal';
import styles from './ChatInput.module.scss';

interface Props {
  onSend: (message: Message, plugin: Plugin | null) => void;
  onRegenerate: () => void;
  onScrollDownClick: () => void;
  stopConversationRef: MutableRefObject<boolean>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  showScrollDownButton: boolean;
}

export const ChatInput = ({ onSend, onRegenerate, onScrollDownClick, stopConversationRef, textareaRef, showScrollDownButton }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, messageIsStreaming, prompts },
  } = useContext(HomeContext);

  const [content, setContent] = useState<string>();
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPromptList, setShowPromptList] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPluginSelect, setShowPluginSelect] = useState(false);
  const [plugin, setPlugin] = useState<Plugin | null>(null);

  const promptListRef = useRef<HTMLUListElement | null>(null);

  const filteredPrompts = prompts.filter((prompt) => prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()));

  const handleChange = (value: string) => {
    const maxLength = selectedConversation?.model.maxLength;

    if (maxLength && value.length > maxLength) {
      alert(t(`Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`, { maxLength, valueLength: value.length }));
      return;
    }

    setContent(value);
    updatePromptListVisibility(value);
  };

  const handleSend = () => {
    if (messageIsStreaming) {
      return;
    }

    if (!content) {
      alert(t('Please enter a message'));
      return;
    }

    onSend({ role: 'user', content }, plugin);
    setContent('');
    setPlugin(null);

    if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleStopConversation = () => {
    stopConversationRef.current = true;
    setTimeout(() => {
      stopConversationRef.current = false;
    }, 1000);
  };

  const isMobile = () => {
    const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleInitModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex];
    if (selectedPrompt) {
      setContent((prevContent) => {
        const newContent = prevContent?.replace(/\/\w*$/, selectedPrompt.content);
        return newContent;
      });
      handlePromptSelect(selectedPrompt);
    }
    setShowPromptList(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) => (prevIndex < prompts.length - 1 ? prevIndex + 1 : prevIndex));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) => (prevIndex < prompts.length - 1 ? prevIndex + 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    } else if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === '/' && e.metaKey) {
      e.preventDefault();
      setShowPluginSelect(!showPluginSelect);
    }
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }

    return foundVariables;
  };

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);

    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    setVariables(parsedVariables);

    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      setContent((prevContent) => {
        const updatedContent = prevContent?.replace(/\/\w*$/, prompt.content);
        return updatedContent;
      });
      updatePromptListVisibility(prompt.content);
    }
  };

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = content?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setContent(newContent);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 30;
    }
  }, [activePromptIndex]);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'}`;
    }
  }, [content]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (promptListRef.current && !promptListRef.current.contains(e.target as Node)) {
        setShowPromptList(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className={`absolute bottom-0 w-full max-w-7xl py-6 ${styles.chatInputWrapperDiv}`}>
      <div className="stretch mx-2 mt-4 flex flex-col gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto pr-16  ">
        {messageIsStreaming && (
          <button className="w-full mx-auto mb-3 flex items-center gap-3 rounded border border-neutral-200 py-2 px-4 " onClick={handleStopConversation}>
            <IconPlayerStop size={16} /> {t('Stop Generating')}
          </button>
        )}

        {!messageIsStreaming && selectedConversation && selectedConversation.messages.length > 0 && (
          <button className="w-full mx-auto mb-3 flex items-center gap-3 rounded border border-neutral-200 py-2 px-4 " onClick={onRegenerate}>
            <IconRepeat size={16} /> {t('Regenerate response')}
          </button>
        )}

        <div className="w-full pt-4">
          <div className="relative flex w-full flex-grow flex-col mb-8">
            <button
              className="absolute left-2 top-4 rounded-sm p-1 pt-2 opacity-60"
              onClick={() => setShowPluginSelect(!showPluginSelect)}
              onKeyDown={(e) => {}}
            >
              {plugin ? <IconBrandGoogle size={20} /> : <IconBolt size={20} />}
            </button>

            {showPluginSelect && (
              <div className="absolute left-0 bottom-14 rounded">
                <PluginSelect
                  plugin={plugin}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setShowPluginSelect(false);
                      textareaRef.current?.focus();
                    }
                  }}
                  onPluginChange={(plugin: Plugin) => {
                    setPlugin(plugin);
                    setShowPluginSelect(false);

                    if (textareaRef && textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                />
              </div>
            )}

            <TextareaAutosize
              label={null}
              id="chat-input"
              modelValue={content}
              maxHeight={400}
              minHeight={30}
              placeholder={t('Type a message or type "/" to select a prompt...') || ''}
              onUpdate={(e) => handleChange(e?.toString() || '')}
              onKeyDown={handleKeyDown}
              textAreaClassName="px-8"
              rows={1}
            />

            <button className="absolute right-2 top-4 rounded-sm p-1  pt-2 opacity-60" onClick={handleSend}>
              {messageIsStreaming ? (
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
              ) : (
                <IconSend size={18} />
              )}
            </button>
          </div>
          {showScrollDownButton && (
            <div className="absolute bottom-12 right-0 lg:bottom-0 lg:-right-10">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onScrollDownClick}
              >
                <IconArrowDown size={18} />
              </button>
            </div>
          )}

          {showPromptList && filteredPrompts.length > 0 && (
            <div className="absolute bottom-12 w-full">
              <PromptList
                activePromptIndex={activePromptIndex}
                prompts={filteredPrompts}
                onSelect={handleInitModal}
                onMouseOver={setActivePromptIndex}
                promptListRef={promptListRef}
              />
            </div>
          )}

          {isModalVisible && (
            <VariableModal prompt={filteredPrompts[activePromptIndex]} variables={variables} onSubmit={handleSubmit} onClose={() => setIsModalVisible(false)} />
          )}
        </div>
      </div>
    </div>
  );
};
