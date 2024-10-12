import { UseViewByteHelper } from '@/components/bytes/View/useViewByteHelper';
import { ByteStepDto } from '@/types/bytes/ByteDto';
import { ByteStepItemResponse } from '@/utils/byte/TempByteSubmission';
import { ByteQuestionFragmentFragment } from '@/graphql/generated/generated-types';
import Question from '@/components/app/Common/Question';
import Button from '@dodao/web-core/components/core/buttons/Button';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';

export interface ByteQuestionItemSectionProps {
  viewByteHelper: UseViewByteHelper;
  step: ByteStepDto;
  question: ByteQuestionFragmentFragment;
  stepItemSubmission: ByteStepItemResponse | undefined;
  onSelectAnswer: (questionId: string, selectedAnswers: string[]) => void;
  isSwiper: boolean;
}

function SubmitButtonOrText({
  stepItemSubmission,
  answeredCorrectly,
  isSubmitted,
  setIsSubmitted,
}: {
  stepItemSubmission: string[];
  answeredCorrectly: boolean;
  isSubmitted: boolean;
  setIsSubmitted: (isSubmitted: boolean) => void;
}) {
  if (isSubmitted && answeredCorrectly) {
    return <p className="text-green-600">Correct!</p>;
  }

  return (
    <Button
      primary={true}
      disabled={!(stepItemSubmission as string[])?.length}
      onClick={() => {
        setIsSubmitted(true);
      }}
    >
      Submit
    </Button>
  );
}

export function ByteQuestionItemSection({ viewByteHelper, step, question, stepItemSubmission, onSelectAnswer, isSwiper }: ByteQuestionItemSectionProps) {
  const answeredCorrectly = isEqual(question.answerKeys.sort(), ((stepItemSubmission as string[]) || []).sort());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const showCorrectAnswers = ((viewByteHelper.isStepTouched(step.uuid) && !isSwiper) || (isSwiper && isSubmitted)) && !answeredCorrectly;
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Question</h2>
      <Question key={question.uuid} question={question} questionResponse={(stepItemSubmission as string[]) || []} onSelectAnswer={onSelectAnswer} />
      {isSwiper && (
        <div className="w-full flex justify-center align-center mt-4">
          <SubmitButtonOrText
            stepItemSubmission={(stepItemSubmission as string[]) || []}
            answeredCorrectly={answeredCorrectly}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
          />
        </div>
      )}
      {showCorrectAnswers && (
        <div>
          <h3 className="text-xl font-semibold sm:mb-2 mt-2">Correct Answer</h3> {/* Move the "Correct Answer" heading outside the green border */}
          <div className="border-2 rounded-lg border-green-500 p-4 mt-2">
            <Question
              question={{
                ...question,
                uuid: question.uuid + '_readonly',
              }}
              questionResponse={question.answerKeys || []}
              onSelectAnswer={() => {
                // do nothing
              }}
              readonly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
