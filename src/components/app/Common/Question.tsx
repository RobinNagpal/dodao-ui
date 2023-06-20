import Checkbox from '@/components/app/Form/Checkbox';
import Radio from '@/components/app/Form/Radio';
import HintIcon from '@/components/core/icons/HintIcon';
import {
  ByteQuestionFragmentFragment,
  CourseQuestionFragment,
  CourseReadingQuestionFragment,
  GuideQuestionFragment,
} from '@/graphql/generated/generated-types';
import { QuestionType } from '@/types/deprecated/models/enums';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import isEqual from 'lodash/isEqual';
import { marked } from 'marked';
import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-yaml';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const HintIconWrapper = styled.div`
  cursor: pointer;
`;

interface LocalQuestionType
  extends Omit<CourseQuestionFragment | GuideQuestionFragment | ByteQuestionFragmentFragment | CourseReadingQuestionFragment, 'hint' | 'explanation'> {
  hint?: string;
  explanation?: string;
}

interface QuestionProps {
  answerClass?: string;
  question: LocalQuestionType;
  questionResponse: string[];
  readonly?: boolean;
  showHint?: boolean;
  correctAnswer?: string[];
  onSelectAnswer: (uuid: string, selectedAnswers: string[]) => void;
}

function Question({ answerClass = '', question, questionResponse, readonly, showHint = false, onSelectAnswer }: QuestionProps) {
  const renderer = getMarkedRenderer();
  const questionContent = marked.parse(question.content, { renderer });

  const [currentlySelectedChoices, setCurrentlySelectedChoices] = useState<string[]>(questionResponse);

  const [displayHint, setDisplayHint] = useState<boolean>(false);

  useEffect(() => {
    setCurrentlySelectedChoices(questionResponse);
  }, [questionResponse]);

  useEffect(() => {
    setDisplayHint(false);
  }, [question]);

  const selectMultipleChoice = (choiceKey: string, selected: boolean) => {
    const selectedAnswers = selected ? [...currentlySelectedChoices, choiceKey] : currentlySelectedChoices.filter((choice) => choice !== choiceKey);
    onSelectAnswer(question.uuid, selectedAnswers);
  };

  const selectSingleChoice = (choiceKey: string) => {
    const selectedAnswers = isEqual(currentlySelectedChoices, [choiceKey]) ? [] : [choiceKey];
    onSelectAnswer(question.uuid, selectedAnswers);
  };

  const questionWithFormattedChoices = {
    ...question,
    choices: (question.choices || ([] as LocalQuestionType[])).map((choice) => ({
      ...choice,
      content: marked.parse(choice.content, { renderer }),
    })),
  };

  return (
    <div className="bg-skin-block-bg">
      <div className="flex justify-between items-center content-center">
        <div className="markdown-body mb-2" dangerouslySetInnerHTML={{ __html: questionContent }}></div>
        {showHint && question.hint && question.hint.toLowerCase() !== 'nohint' && (
          <HintIconWrapper onClick={() => setDisplayHint(!displayHint)}>
            <HintIcon height="30px" />
          </HintIconWrapper>
        )}
      </div>
      {questionWithFormattedChoices.choices.map((choice) => (
        <div key={choice.key} className={`flex leading-loose items-center ${question.type === QuestionType.SingleChoice ? '-ml-2' : 'py-2'}`}>
          {question.type === QuestionType.SingleChoice ? (
            <Radio
              id={question.uuid + choice.key}
              questionId={question.uuid}
              labelContent={choice.content}
              isSelected={currentlySelectedChoices.includes(choice.key)}
              onChange={() => selectSingleChoice(choice.key)}
              readonly={readonly}
            />
          ) : (
            <Checkbox
              id={question.uuid + choice.key}
              labelContent={choice.content}
              onChange={(event: boolean) => selectMultipleChoice(choice.key, event)}
              isChecked={currentlySelectedChoices.includes(choice.key)}
              className={answerClass}
              readonly={readonly}
            />
          )}
        </div>
      ))}
      {displayHint && (
        <div className="border-t p-2 mt-4">
          <p>Hint: {question.hint}</p>
        </div>
      )}
    </div>
  );
}

export default Question;
