import { GeneratedQuestionInterface } from '@/components/ai/questions/GenerateQuestionsUsingAI';
import { EditByteStep, EditByteType } from '@/components/bytes/Edit/useEditByte';
import Button from '@/components/core/buttons/Button';
import ErrorWithAccentBorder from '@/components/core/errors/ErrorWithAccentBorder';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { NotificationProps } from '@/components/core/notify/Notification';
import TextareaAutosize from '@/components/core/textarea/TextareaAutosize';
import generateQuestionsPrompt from '@/components/guides/Edit/generateQuestionsPrompt';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum, useAskChatCompletionAiMutation, useDownloadAndCleanContentMutation } from '@/graphql/generated/generated-types';
import { PublishStatus, QuestionType, VisibilityEnum } from '@/types/deprecated/models/enums';
import { sum } from 'lodash';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import geneateBytePrompt from './generateBytePrompt';

export interface CreateByteUsingAIModalProps {
  open: boolean;
  onClose: () => void;
  onGenerateByte: (byte: EditByteType) => void;
}

export interface GeneratedByte {
  id: string;
  name: string;
  content: string;
  steps: { name: string; content: string }[];
}
export function CreateByteUsingAIModal(props: CreateByteUsingAIModalProps) {
  const { open, onClose, onGenerateByte } = props;
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [askChatCompletionAiMutation] = useAskChatCompletionAiMutation();
  const [downloadAndCleanContentMutation] = useDownloadAndCleanContentMutation();

  const [topic, setTopic] = useState<string>();
  const [contents, setContents] = useState<string>();

  const { showNotification } = useNotificationContext();
  const handleShowNotification = (notificationProps: NotificationProps) => {
    showNotification(notificationProps);
  };

  const generateByteContent = async (): Promise<string | undefined> => {
    const cleanContents = await downloadAndCleanContentMutation({
      variables: {
        input: contents!,
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

    const inputContent = geneateBytePrompt(topic!, cleanedContentText);

    const response = await askChatCompletionAiMutation({
      variables: {
        input: {
          messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }],
          model: 'gpt-4',
        },
      },
    });

    const data = await response?.data?.askChatCompletionAI?.choices?.[0]?.message?.content;

    return data || undefined;
  };

  const generateQuestionsContent = async (parsedData: GeneratedByte): Promise<string | undefined> => {
    const questionsContent = `
        ${parsedData.name}
        ${parsedData.content}
        
        ${parsedData.steps.map((step) => `${step.name} \n ${step.content}`).join('\n')}
      `;

    const questionsPrompt = generateQuestionsPrompt(parsedData.name, 2, questionsContent);

    const questionsResponse = await askChatCompletionAiMutation({
      variables: {
        input: {
          messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: questionsPrompt }],
          temperature: 0.3,
          model: 'gpt-3.5-turbo-16k',
        },
      },
    });

    const questionsData = questionsResponse?.data?.askChatCompletionAI?.choices?.[0]?.message?.content;

    if (!questionsData) {
      setLoading(false);
      setError('Got no response from AI. Please try again.');
      return;
    }

    return questionsData;
  };

  const addGeneratedQuestions = (steps: EditByteStep[], generatedQuestions: GeneratedQuestionInterface[]) => {
    const questionsSteps: EditByteStep[] = generatedQuestions.map((generatedQuestion, index) => ({
      uuid: uuidv4(),
      name: 'Evaluation',
      content: '',
      stepItems: [
        {
          uuid: uuidv4(),
          ...generatedQuestion,
          type: QuestionType.SingleChoice,
          order: 0,
        },
      ],
    }));

    return [...steps, ...questionsSteps];
  };

  const generateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateByteContent();

      if (!data) {
        return;
      }

      const parsedData = JSON.parse(data) as GeneratedByte;

      const steps = parsedData.steps.map((step) => ({ ...step, uuid: uuidv4(), stepItems: [] }));

      const questionsContent = await generateQuestionsContent(parsedData);

      if (!questionsContent) {
        return;
      }

      const stepsWithQuestions = addGeneratedQuestions(steps, JSON.parse(questionsContent) as GeneratedQuestionInterface[]);

      const editByteType: EditByteType = {
        ...parsedData,
        admins: [],
        byteExists: false,
        created: new Date().toISOString(),
        isPristine: true,
        priority: 0,
        publishStatus: PublishStatus.Draft,
        visibility: VisibilityEnum.Public,
        tags: [],
        steps: stepsWithQuestions,
      };
      setLoading(false);

      if (parsedData?.id) {
        onGenerateByte(editByteType);

        onClose();
      } else {
        handleShowNotification({
          heading: 'Error',
          type: 'error',
          message: 'The Tidbit Was not generated properly either the content given was inappropriate or server issue please try again later ',
        });
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      handleShowNotification({ heading: 'TimeOut Error', type: 'error', message: 'This request Took More time then Expected Please Try Again' });
    }
  };
  return (
    <FullScreenModal open={open} onClose={onClose} title="Create Tidbit Using AI">
      <div className="text-left	">
        <div className=" container  mx-auto p-4 flex flex-col ">
          <TextareaAutosize
            label="Topic"
            id="topic"
            autosize={true}
            modelValue={topic}
            onUpdate={(e) => setTopic(e?.toString() || '')}
            className="mt-2"
            maxHeight={150}
            placeholder={'Just mention a sentence or two about the topic of the Tidbit'}
          />
          <TextareaAutosize
            label="Content"
            id="content"
            autosize={true}
            modelValue={contents}
            minHeight={250}
            onUpdate={(e) => setContents(e?.toString() || '')}
            className="mt-2"
            placeholder={'Enter all the content and the links from where you want to generate the Tidbit'}
          />
          {error && <ErrorWithAccentBorder error={error} className={'my-4'} />}
          <Button
            loading={loading}
            disabled={!topic?.trim() || !contents?.trim()}
            onClick={() => generateResponse()}
            variant="contained"
            primary
            className="mt-4"
          >
            Generate Using AI
          </Button>{' '}
        </div>
      </div>
    </FullScreenModal>
  );
}
