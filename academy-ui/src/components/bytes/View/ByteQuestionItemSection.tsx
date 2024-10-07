import { UseViewByteHelper } from '@/components/bytes/View/useViewByteInModal';
import { ByteStepDto } from '@/types/bytes/ByteDto';
import { StepItemResponse } from '@/utils/byte/TempByteSubmission';
import { ByteQuestionFragmentFragment } from '@/graphql/generated/generated-types';
import Question from '@/components/app/Common/Question';
import isEqual from 'lodash/isEqual';

export function ByteQuestionItemSection({
  viewByteHelper,
  step,
  question,
  stepItemSubmission,
  onSelectAnswer,
}: {
  viewByteHelper: UseViewByteHelper;
  step: ByteStepDto;
  question: ByteQuestionFragmentFragment;
  stepItemSubmission: StepItemResponse | undefined;
  onSelectAnswer: (questionId: string, selectedAnswers: string[]) => void;
}) {
  const answeredCorrectly = isEqual(question.answerKeys.sort(), ((stepItemSubmission as string[]) || []).sort());

  const showCorrectAnswerAlso = !viewByteHelper.isPristine(step.uuid) && !answeredCorrectly;
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Question</h2>
      <Question key={question.uuid} question={question} questionResponse={(stepItemSubmission as string[]) || []} onSelectAnswer={onSelectAnswer} />
      {showCorrectAnswerAlso && (
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
