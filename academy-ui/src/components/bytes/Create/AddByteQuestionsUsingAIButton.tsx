import { GeneratedQuestionInterface } from '@/components/ai/questions/GenerateQuestionsUsingAI';
import { GeneratedByte } from '@/components/bytes/Create/CreateByteUsingAIModal';
import { EditByteStep } from '@/components/bytes/Edit/editByteHelper';
import Button from '@dodao/web-core/components/core/buttons/Button';
import generateQuestionsPrompt from '@/components/guides/Edit/generateQuestionsPrompt';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ChatCompletionRequestMessageRoleEnum } from '@/graphql/generated/generated-types';
import { QuestionType } from '@dodao/web-core/types/deprecated/models/enums';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export interface AddByteQuestionsUsingAIButtonProps {
  byte: GeneratedByte;
  onNewStepsWithQuestions: (steps: EditByteStep[]) => void;
}
export default function AddByteQuestionsUsingAIButton(props: AddByteQuestionsUsingAIButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationContext();
  const generateQuestionsContent = async (byte: GeneratedByte): Promise<string | undefined> => {
    const questionsContent = `
        ${byte.name}
        ${byte.content}
        
        ${byte.steps.map((step) => `${step.name} \n ${step.content}`).join('\n')}
      `;

    const questionsPrompt = generateQuestionsPrompt(byte.name, 2, questionsContent);

    const questionsResponse = await axios.post(`${getBaseUrl()}/api/openAI/ask-chat-completion-ai`, {
      input: { messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: questionsPrompt }] },
      temperature: 0.3,
      model: 'gpt-4',
    });

    const questionsData = questionsResponse?.data?.completion?.choices?.[0]?.message?.content;

    if (!questionsData) {
      setLoading(false);
      showNotification({
        type: 'error',
        message: 'Got no response from AI. Please try again.',
      });
      return;
    }

    return questionsData;
  };

  const createQuestionSteps = (generatedQuestions: GeneratedQuestionInterface[]) => {
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

    return questionsSteps;
  };

  const generateQuestionSteps = async () => {
    setLoading(true);
    const questions = await generateQuestionsContent(props.byte);
    if (questions) {
      const newSteps = createQuestionSteps(JSON.parse(questions));
      props.onNewStepsWithQuestions(newSteps);
    }
    setLoading(false);
  };
  return (
    <Button loading={loading} disabled={loading || props.byte.steps.length < 3} onClick={() => generateQuestionSteps()} className="ml-2">
      Add Questions with AI
    </Button>
  );
}
