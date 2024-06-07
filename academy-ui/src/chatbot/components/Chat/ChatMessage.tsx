import { CodeBlock } from '@/chatbot/components/Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '@/chatbot/components/Markdown/MemoizedReactMarkdown';

import HomeContext from '@/chatbot/home/home.context';
import { ConversationMessage } from '@/chatbot/types/chat';
import FAQs from '@dodao/web-core/components/app/Faq/FAQs';
import CommandLineIcon from '@heroicons/react/24/outline/CommandLineIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/outline/QuestionMarkCircleIcon';
import { IconUser } from '@tabler/icons-react';
import { FC, memo, useContext, useEffect } from 'react';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import styles from './ChatMessage.module.scss';

export interface Props {
  message: ConversationMessage;
  messageIndex: number;
  onEdit?: (editedMessage: ConversationMessage) => void;
  onScrollDownClick: () => void;
}

export const ChatMessage: FC<Props> = memo(({ message, messageIndex, onEdit, onScrollDownClick }) => {
  const {
    state: { selectedConversation, messageIsStreaming },
  } = useContext(HomeContext);

  useEffect(() => {
    onScrollDownClick();
  }, [message.assistantResponse]);

  const hasRelatedQuestions = (message.relatedFAQs || []).length > 0;
  return (
    <div className="border-b">
      <div className={`group overflow-scroll px-4 text-base`}>
        <div className="relative m-auto flex p-4 md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
          <div className={'min-w-[40px] text-right font-bold ' + styles.chatMessageIcons}>
            <IconUser className="mr-4" size={30} />
          </div>

          <div className="prose mt-[-2px] w-full dark:prose-invert">
            <div className="flex flex-row">{message.userQuestion}</div>
          </div>
        </div>
      </div>
      {hasRelatedQuestions && (
        <div className={`group overflow-scroll px-4 text-base`}>
          <div className="relative m-auto flex p-4 md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
            <div className={'min-w-[40px] text-right font-bold ' + styles.chatMessageIcons}>
              <QuestionMarkCircleIcon className="mr-4" width={30} height={30} />
            </div>

            <div className="prose mt-[-2px] w-full dark:prose-invert">
              <div className="flex flex-row">
                <FAQs faqs={message.relatedFAQs || []} compact={true} heading={'Related Questions'} />
              </div>
            </div>
          </div>
        </div>
      )}
      {message.assistantResponse && (
        <div className={`group overflow-scroll px-4 text-sm markdown-body pb-28`}>
          <div className="relative m-auto flex p-4 md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
            <div className={'min-w-[40px] text-right font-bold ' + styles.chatMessageIcons}>
              <CommandLineIcon width={30} height={30} className="mr-4" />
            </div>

            <div className="prose mt-[-2px] w-full dark:prose-invert">
              <div className="flex flex-row">
                <MemoizedReactMarkdown
                  linkTarget="_blank"
                  className="prose dark:prose-invert flex-1"
                  remarkPlugins={[remarkGfm, remarkMath]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      if (children.length) {
                        if (children[0] == '▍') {
                          return <span className="animate-pulse cursor-default mt-1">▍</span>;
                        }

                        children[0] = (children[0] as string).replace('`▍`', '▍');
                      }

                      const match = /language-(\w+)/.exec(className || '');

                      return !inline ? (
                        <CodeBlock key={Math.random()} language={(match && match[1]) || ''} value={String(children).replace(/\n$/, '')} {...props} />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return <table className="border-collapse border border-black px-3 py-1 dark:border-white">{children}</table>;
                    },
                    th({ children }) {
                      return <th className="break-words border border-black bg-gray-500 px-3 py-1">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="break-words border border-black px-3 py-1 dark:border-white">{children}</td>;
                    },
                  }}
                >
                  {`${message.assistantResponse}${messageIsStreaming && messageIndex == (selectedConversation?.messages.length ?? 0) - 1 ? '`▍`' : ''}`}
                </MemoizedReactMarkdown>{' '}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';
