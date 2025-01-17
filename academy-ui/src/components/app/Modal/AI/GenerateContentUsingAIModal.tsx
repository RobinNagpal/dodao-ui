import Button from '@dodao/web-core/components/core/buttons/Button';
import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, DownloadAndCleanContentResponse } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { sum } from 'lodash';

import { useState } from 'react';
import axios from 'axios';

export interface GenerateContentUsingAIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateContent: (content: string | null | undefined) => void;
  modalTitle: string;
  guidelines: string;
  generatePrompt: (topic: string, guidelines: string, cleanedContent: string) => string;
  generateNewContent?: boolean; // If true, generate new content. If false, rewrite content
}

export default function GenerateContentUsingAIModal(props: GenerateContentUsingAIModalProps) {
  const { open, onClose } = props;

  const [loading, setLoading] = useState(false);

  const [topic, setTopic] = useState<string>('');
  const [contents, setContents] = useState<string>('');
  const [guidelines, setGuideLines] = useState<string>(props.guidelines);

  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotificationContext();
  const rewriteAndGenerateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      if (topic.length < 10) {
        setLoading(false);
        setError('Please enter a topic with at least 10 characters');
        return;
      }

      const cleanContents = await axios.post(`${getBaseUrl()}/api/openAI/download-and-clean-content`, {
        input: contents,
      });

      const cleanContentResponse: DownloadAndCleanContentResponse = cleanContents.data?.downloadAndCleanContent;
      const links = cleanContentResponse?.links;
      const tokenCount = (links?.length || 0) > 0 ? sum(links?.map((link) => link?.tokenCount || 0)) : 0;
      const cleanedContentText = cleanContentResponse?.content!;

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

      const response = await axios.post('/api/openAI/ask-chat-completion-ai', {
        input: {
          messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
          model: 'gpt-3.5-turbo-16k',
          temperature: 0.2,
        },
      });

      const data = await response?.data?.completion?.choices?.[0]?.message?.content;

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

  const writeNewContentAndGenerateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      if (topic.length < 10) {
        setLoading(false);
        setError('Please enter a topic with at least 10 characters');
        return;
      }

      const inputContent = props.generatePrompt(topic, guidelines, '');

      const response = await axios.post('/api/openAI/ask-chat-completion-ai', {
        input: {
          messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
          model: 'gpt-3.5-turbo-16k',
          temperature: 0.2,
        },
      });
      const data = response?.data?.completion?.choices?.[0]?.message?.content;

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
    <FullPageModal open={open} onClose={onClose} title={props.modalTitle}>
      <div className="text-left	p-4">
        <Input
          label="Topic"
          id="topic"
          modelValue={topic}
          onUpdate={(e) => setTopic(e?.toString() || '')}
          placeholder={'Just mention a sentence about the topic'}
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

        {!props.generateNewContent && (
          <TextareaAutosize
            label="Content (Include links form which AI will generate content))"
            id="content"
            autosize={true}
            modelValue={contents}
            minHeight={250}
            onUpdate={(e) => setContents(e?.toString() || '')}
            className="mt-6"
            placeholder={'Enter all the content and the links from where you want to generate the Content'}
            infoText={'Please enter the content and the links from where you want to generate the Content'}
          />
        )}

        {error && <ErrorWithAccentBorder error={error} className={'my-4'} />}
        <Button
          loading={loading}
          onClick={async () => {
            if (!props.generateNewContent) {
              await rewriteAndGenerateResponse();
            } else {
              await writeNewContentAndGenerateResponse();
            }
          }}
          variant="contained"
          primary
          className="mt-4"
        >
          Generate Using AI
        </Button>
      </div>
    </FullPageModal>
  );
}
