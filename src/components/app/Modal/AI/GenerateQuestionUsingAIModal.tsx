import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import StyledSelect from '@/components/core/select/StyledSelect';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  AskChatCompletionAiMutation,
  ChatCompletionRequestMessageRoleEnum,
  useAskChatCompletionAiMutation,
  useDownloadAndCleanContentMutation,
} from '@/graphql/generated/generated-types';
import { PublishStatus } from '@/types/deprecated/models/enums';
import { publishStatusesSelect } from '@/utils/ui/statuses';
import { FetchResult } from '@apollo/client';

import React, { useState } from 'react';

export interface GenerateQuestionUsingAIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateContent: (questions: GeneratedQuestionInterface[]) => void;
  modalTitle: string;
  topic: string;
  generatePrompt: (topic: string, numberOfQuestion: number, cleanedContent: string) => string;
}

export interface GeneratedQuestionInterface {
  content: string;
  answerKeys: string[];
  choices: { content: string; key: string }[];
  explanation: string;
}

export default function GenerateQuestionUsingAIModal(props: GenerateQuestionUsingAIModalProps) {
  const { open, onClose } = props;

  const [loading, setLoading] = useState(false);
  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [downloadAndCleanContentMutation] = useDownloadAndCleanContentMutation();

  const [topic, setTopic] = useState<string>(props.topic);
  const [contents, setContents] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(3);
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

      const downloadAndCleanContent = cleanContents.data?.downloadAndCleanContent;
      const tokenCount = downloadAndCleanContent?.tokenCount;
      const text = downloadAndCleanContent?.text;

      if (!text) {
        setLoading(false);
        setError('Please enter valid content');
        return;
      }

      if (tokenCount && tokenCount > 12000) {
        setLoading(false);
        setError('Please enter less content');
        return;
      }

      const inputContent = props.generatePrompt(topic, numberOfQuestions, text!);

      const response = await askChatCompletionAiMutation({
        variables: {
          input: {
            messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
            model: 'gpt-3.5-turbo-16k',
          },
        },
      });

      try {
        const data = response?.data?.askChatCompletionAI?.choices?.[0]?.message?.content;

        if (!data) {
          setLoading(false);
          setError('Was not able to create questions from the content. Please try again.');
          return;
        }

        const questions = JSON.parse(data);
        setLoading(false);
        props.onGenerateContent(questions);
      } catch (e) {
        console.error(e);
        console.log('response', response);
        setLoading(false);
        setError('Was not able to create questions from the content. Please try again.');
        return;
      }
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

        <StyledSelect
          label="Number of Questions to Generate"
          selectedItemId={numberOfQuestions.toString()}
          items={[
            { id: '1', label: '1' },
            { id: '2', label: '2' },
            { id: '3', label: '3' },
            { id: '4', label: '4' },
          ]}
          setSelectedItemId={(value) => setNumberOfQuestions(parseInt(value))}
          className="mt-2"
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
