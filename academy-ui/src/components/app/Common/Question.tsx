import RadioOption from '@dodao/web-core/components/app/Form/Radio/RadioOption';
import HintIcon from '@dodao/web-core/components/core/icons/HintIcon';
import {
  ByteQuestionFragmentFragment,
  CourseQuestionFragment,
  CourseReadingQuestionFragment,
  GuideQuestionFragment,
} from '@/graphql/generated/generated-types';
import { QuestionType } from '@dodao/web-core/types/deprecated/models/enums';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { RadioGroup } from '@headlessui/react';
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
import styles from './Question.module.scss';
import CheckboxView from '@dodao/web-core/components/app/Form/CheckboxView';

export interface LocalQuestionType
  extends Omit<CourseQuestionFragment | GuideQuestionFragment | ByteQuestionFragmentFragment | CourseReadingQuestionFragment, 'hint' | 'explanation'> {
  hint?: string;
  explanation?: string | null;
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
const renderer = getMarkedRenderer();

function Question({ answerClass = '', question, questionResponse, readonly, showHint = false, onSelectAnswer }: QuestionProps) {
  const questionContent = marked.parse(question.content, { renderer });

  const [displayHint, setDisplayHint] = useState<boolean>(false);

  useEffect(() => {
    setDisplayHint(false);
  }, [question]);

  const selectMultipleChoice = (choiceKey: string, selected: boolean) => {
    const selectedAnswers = selected ? [...questionResponse, choiceKey] : questionResponse.filter((choice) => choice !== choiceKey);
    onSelectAnswer(question.uuid, selectedAnswers);
  };

  const selectSingleChoice = (choiceKey: string | null) => {
    if (!choiceKey) {
      onSelectAnswer(question.uuid, []);
    } else {
      const selectedAnswers = isEqual(questionResponse, [choiceKey]) ? [] : [choiceKey];
      onSelectAnswer(question.uuid, selectedAnswers);
    }
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
        <div className="markdown-body mb-2 text-l text-center w-full" dangerouslySetInnerHTML={{ __html: questionContent }}></div>
        {showHint && question.hint && question.hint.toLowerCase() !== 'nohint' && (
          <div className={styles.hintIconWrapper} onClick={() => setDisplayHint(!displayHint)}>
            <HintIcon height="30px" />
          </div>
        )}
      </div>
      {question.type !== QuestionType.SingleChoice && (
        <div className="w-full text-right ">
          <span className="primary-color mr-3">Select Multiple choices</span>
        </div>
      )}
      {question.type === QuestionType.SingleChoice ? (
        <RadioGroup
          value={questionResponse.length > 0 ? questionResponse[0] : null}
          onChange={(choiceKey) => {
            selectSingleChoice(choiceKey);
          }}
        >
          {questionWithFormattedChoices.choices.map((choice) => {
            const isSelected = questionResponse.includes(choice.key);
            return (
              <div key={choice.key} className={`leading-loose items-center`}>
                <div className="mt-2">
                  <RadioOption
                    optionKey={question.uuid + choice.key}
                    value={choice.key}
                    content={choice.content}
                    isSelected={isSelected}
                    onSelect={selectSingleChoice}
                  />
                </div>
              </div>
            );
          })}
        </RadioGroup>
      ) : (
        questionWithFormattedChoices.choices.map((choice) => {
          const isSelected = questionResponse.includes(choice.key);
          return (
            <div key={choice.key} className={`flex leading-loose items-center `}>
              <CheckboxView
                id={question.uuid + choice.key}
                labelContent={choice.content}
                onChange={(event: boolean) => selectMultipleChoice(choice.key, event)}
                isChecked={isSelected}
                className={answerClass}
                readonly={readonly}
              />
            </div>
          );
        })
      )}
      {displayHint && (
        <div className="border-t p-2 mt-4">
          <p>Hint: {question.hint}</p>
        </div>
      )}
    </div>
  );
}

export default Question;
