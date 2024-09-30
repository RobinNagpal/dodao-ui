import { StepItemResponse } from '@/utils/byte/TempByteSubmission';
import { ByteQuestionFragmentFragment } from '@/graphql/generated/generated-types';
import Question from '@/components/app/Common/Question';

export function QuestionSection(props: {
  showCorrectAnswerAlso: boolean;
  stepItem: ByteQuestionFragmentFragment;
  stepItemSubmission: StepItemResponse | undefined;
  onSelectAnswer: (questionId: string, selectedAnswers: string[]) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Question</h2>
      <Question
        key={props.stepItem.uuid}
        question={props.stepItem}
        questionResponse={(props.stepItemSubmission as string[]) || []}
        onSelectAnswer={props.onSelectAnswer}
      />
      {props.showCorrectAnswerAlso && (
        <div>
          <h3 className="text-xl font-semibold sm:mb-2 mt-2">Correct Answer</h3> {/* Move the "Correct Answer" heading outside the green border */}
          <div className="border-2 rounded-lg border-green-500 p-4 mt-2">
            <Question
              question={{
                ...props.stepItem,
                uuid: props.stepItem.uuid + '_readonly',
              }}
              questionResponse={props.stepItem.answerKeys || []}
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
