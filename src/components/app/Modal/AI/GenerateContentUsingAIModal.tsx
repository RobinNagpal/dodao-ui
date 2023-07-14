import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useDownloadAndCleanContentMutation } from '@/graphql/generated/generated-types';
import { sum } from 'lodash';

import { useState } from 'react';

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
  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [downloadAndCleanContentMutation] = useDownloadAndCleanContentMutation();

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

      const cleanContents = await downloadAndCleanContentMutation({
        variables: {
          input: contents,
        },
      });

      const cleanContentResponse = cleanContents.data?.downloadAndCleanContent;
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

      const response = await askChatCompletionAiMutation({
        variables: {
          input: {
            messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
            model: 'gpt-3.5-turbo-16k',
            temperature: 0.2,
          },
        },
      });

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

      const response = await askChatCompletionAiMutation({
        variables: {
          input: {
            messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
            model: 'gpt-3.5-turbo-16k',
            temperature: 0.2,
          },
        },
      });

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
    </FullScreenModal>
  );
}
