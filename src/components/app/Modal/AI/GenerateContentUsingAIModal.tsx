import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  AskChatCompletionAiMutation,
  ChatCompletionRequestMessageRoleEnum,
  useAskChatCompletionAiMutation,
  useDownloadAndCleanContentMutation,
} from '@/graphql/generated/generated-types';
import { FetchResult } from '@apollo/client';

import { useState } from 'react';

export interface GenerateContentUsingAIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateContent: (content: string | null | undefined) => void;
  modalTitle: string;
  topic: string;
  guidelines: string;
  generatePrompt: (topic: string, guidelines: string, cleanedContent: string) => string;
}

export default function GenerateContentUsingAIModal(props: GenerateContentUsingAIModalProps) {
  const { open, onClose } = props;

  const [loading, setLoading] = useState(false);
  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [downloadAndCleanContentMutation] = useDownloadAndCleanContentMutation();

  const [topic, setTopic] = useState<string>(props.topic);
  const [contents, setContents] = useState<string>('');
  const [guidelines, setGuideLines] = useState<string>(props.guidelines);

  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotificationContext();
  const generateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      const cleanContents = await downloadAndCleanContentMutation({
        variables: {
          input: contents,
        },
      });

      const cleanContentResponse = cleanContents.data?.downloadAndCleanContent;
      const tokenCount = cleanContentResponse?.tokenCount;
      const cleanedContentText = cleanContentResponse?.text!;

      if (!cleanedContentText) {
        setLoading(false);
        setError('Please enter valid content');
        return;
      }

      if (tokenCount && tokenCount > 12000) {
        setLoading(false);
        setError('Please enter less content');
        return;
      }

      const inputContent = props.generatePrompt(topic, guidelines, cleanedContentText);

      const responsePromise = askChatCompletionAiMutation({
        variables: {
          input: {
            messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
            model: 'gpt-3.5-turbo-16k',
          },
        },
      });

      const timeoutDuration = 50000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutDuration);
      });

      const response = (await Promise.race([responsePromise, timeoutPromise])) as FetchResult<AskChatCompletionAiMutation> | undefined;

      const data = await response?.data?.askChatCompletionAI?.choices?.[0]?.message?.content;

      setLoading(false);
      props.onGenerateContent(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
      showNotification({
        heading: 'TimeOut Error',
        type: 'error',
        message: 'This request Took More time then Expected Please Try Again',
      });
    }
  };
  return (
    <FullScreenModal open={open} onClose={onClose} title={props.modalTitle}>
      <div className="text-left	">
        <Input
          label="Topic"
          id="topic"
          modelValue={topic}
          onUpdate={(e) => setTopic(e?.toString() || '')}
          placeholder={'Just mention a sentence or two about the topic of the Tidbit'}
        />

        <TextareaAutosize
          label="Guidelines - This is to help AI generate most relevant content"
          id="content"
          autosize={true}
          modelValue={guidelines}
          minHeight={100}
          onUpdate={(e) => setGuideLines(e?.toString() || '')}
          className="mt-6"
          placeholder={`1. Generate two to three paragraphs of content.
2. Each paragraph should be 3-5 sentences long.`}
        />

        <TextareaAutosize
          label="Content"
          id="content"
          autosize={true}
          modelValue={contents}
          minHeight={250}
          onUpdate={(e) => setContents(e?.toString() || '')}
          className="mt-6"
          placeholder={'Enter all the content and the links from where you want to generate the Tidbit'}
        />

        {error && <ErrorWithAccentBorder error={error} className={'my-4'} />}
        <Button loading={loading} onClick={() => generateResponse()} variant="contained" primary className="mt-4">
          Generate Using AI
        </Button>
      </div>
    </FullScreenModal>
  );
}
