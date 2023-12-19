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
import styles from './Question.module.scss';
import { RadioGroup } from '@headlessui/react';

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

function classNames(...classes: (string | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

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

  const selectSingleChoice = (choiceKey: string) => {
    const selectedAnswers = isEqual(questionResponse, [choiceKey]) ? [] : [choiceKey];
    onSelectAnswer(question.uuid, selectedAnswers);
  };

  const handleRadioChange = (choiceKey: string) => {
    selectSingleChoice(choiceKey);
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
        <div className="markdown-body mb-2 text-l" dangerouslySetInnerHTML={{ __html: questionContent }}></div>
        {showHint && question.hint && question.hint.toLowerCase() !== 'nohint' && (
          <div className={styles.hintIconWrapper} onClick={() => setDisplayHint(!displayHint)}>
            <HintIcon height="30px" />
          </div>
        )}
      </div>
      {questionWithFormattedChoices.choices.map((choice) => {
        const isSelected = questionResponse.includes(choice.key);
        return (
          <div key={choice.key} className={`leading-loose items-center py-2 sm:py-0 ${question.type === QuestionType.SingleChoice ? '-ml-2' : 'py-2'}`}>
            {question.type === QuestionType.SingleChoice ? (
              <RadioGroup className="mt-2" value={questionResponse.length > 0 ? questionResponse[0] : null} onChange={handleRadioChange}>
                <div className="space-y-4">
                  <RadioGroup.Option
                    key={question.uuid + choice.key}
                    value={choice.key}
                    className={({ active }) =>
                      classNames(
                        active ? `${styles.activeBorderColor} ring-2` : 'border-gray-300',
                        `relative block cursor-pointer rounded-lg border px-6 py-4 shadow-sm focus:outline-none ${styles.backgroundColor}`
                      )
                    }
                  >
                    {({ active, checked }) => (
                      <>
                        <span className="flex items-center">
                          <span className="flex flex-col text-sm">
                            <RadioGroup.Label as="span" className="font-medium" dangerouslySetInnerHTML={{ __html: choice.content }} />
                          </span>
                        </span>
                        <span
                          className={classNames(
                            active ? `${styles.activeBorderColor}` : 'border-2',
                            checked ? `${styles.selectedBorderColor}` : 'border-transparent',
                            'pointer-events-none absolute -inset-px rounded-lg'
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </RadioGroup.Option>
                </div>
              </RadioGroup>
            ) : (
              <Checkbox
                id={question.uuid + choice.key}
                labelContent={choice.content}
                onChange={(event: boolean) => selectMultipleChoice(choice.key, event)}
                isChecked={isSelected}
                className={answerClass}
                readonly={readonly}
              />
            )}
          </div>
        );
      })}

      {displayHint && (
        <div className="border-t p-2 mt-4">
          <p>Hint: {question.hint}</p>
        </div>
      )}
    </div>
  );
}

export default Question;
