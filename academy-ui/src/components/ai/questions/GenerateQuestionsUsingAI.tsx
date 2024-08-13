import Button from '@dodao/web-core/components/core/buttons/Button';
import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import WarningWithAccentBorder from '@dodao/web-core/components/core/warnings/WarningWithAccentBorder';
import { ChatCompletionRequestMessageRoleEnum } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

import React, { useState } from 'react';
import axios from 'axios';

export interface GenerateQuestionUsingAIProps {
  onGenerateContent: (questions: GeneratedQuestionInterface[]) => void;
  generatePrompt: (topic: string, numberOfQuestion: number, cleanedContent: string) => string;
}

export interface GeneratedQuestionInterface {
  content: string;
  answerKeys: string[];
  choices: { content: string; key: string }[];
  explanation: string;
}

function containsURL(str: string): boolean {
  const urlRegex: RegExp = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(str);
}

export default function GenerateQuestionsUsingAI(props: GenerateQuestionUsingAIProps) {
  const [loading, setLoading] = useState(false);

  const [topic, setTopic] = useState<string>('');
  const [contents, setContents] = useState<string>('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  const [warning, setWarning] = useState<string | null>(null);

  const generateResponse = async () => {
    setLoading(true);
    setError(null);

    try {
      if (topic.length < 10) {
        setLoading(false);
        setError('Please enter a topic with at least 10 characters');
        return;
      }
      const inputContent = props.generatePrompt(topic, numberOfQuestions, contents);

      const response = await axios.post(`${getBaseUrl()}/api/openAI/ask-chat-completion-ai`, {
        input: { messages: [{ role: ChatCompletionRequestMessageRoleEnum.User, content: inputContent }] },
        temperature: 0.3,
        model: 'gpt-4',
      });

      try {
        const data = response?.data?.completion?.choices?.[0]?.message?.content;

        if (!data) {
          setLoading(false);
          setError('Got no response from AI. Please try again.');
          return;
        }

        const questions = JSON.parse(data);
        setLoading(false);
        props.onGenerateContent(questions);
      } catch (e) {
        console.error(e);
        console.log('response', response);
        setLoading(false);
        setError('Was not able to create questions from the content. Details :' + e?.toString());
        return;
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError('Was not able to create questions from the content. Details :' + error?.toString());
    }
  };
  return (
    <div className="text-left	">
      <Input
        label="Topic"
        info={"This will be used to generate the questions. It's better to be specific. Add 7-10 words."}
        id="topic"
        className="mb-6"
        modelValue={topic}
        onUpdate={(e) => setTopic(e?.toString() || '')}
        placeholder={'Just mention a sentence or two about the topic on which you want to generate the questions.'}
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
        setSelectedItemId={(value) => setNumberOfQuestions(value ? parseInt(value) : 2)}
        className="mt-2"
      />

      <TextareaAutosize
        label="Content"
        id="content"
        autosize={true}
        modelValue={contents}
        minHeight={250}
        onUpdate={(e) => {
          const contents = e?.toString() || '';
          if (contents.length > 6000) {
            setWarning('Content is too long. Lesser the content, more relevant the questions are.');
          } else if (containsURL(contents)) {
            setWarning('Content contains URL. Please remove the URL from the content.');
          } else {
            setWarning(null);
          }
          setContents(contents);
        }}
        className="mt-6"
        placeholder={'Enter all the content and the links from where you want to generate the guestions'}
      />

      {warning && <WarningWithAccentBorder warning={warning} className={'my-4'} />}
      {error && <ErrorWithAccentBorder error={error} className={'my-4'} />}

      <Button loading={loading} onClick={() => generateResponse()} variant="contained" primary className="mt-4">
        Generate Using AI
      </Button>
    </div>
  );
}
