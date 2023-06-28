import { StepItemResponse } from '@/utils/byte/TempByteSubmission';
import { ByteQuestionFragmentFragment } from '@/graphql/generated/generated-types';
import Question from '@/components/app/Common/Question';

export function QuestionSection(props: {
  nextButtonClicked: boolean;
  allQuestionsAnsweredCorrectly: boolean;
  allQuestionsAnswered: boolean;
  stepItem: ByteQuestionFragmentFragment;
  stepItemSubmission: StepItemResponse | undefined;
  onSelectAnswer: (questionId: string, selectedAnswers: string[]) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Question</h2>
      <div
        className={
          props.nextButtonClicked && !props.allQuestionsAnsweredCorrectly && props.allQuestionsAnswered ? 'border-2 rounded-lg p-4 border-red-500' : ''
        }
      >
        {/* Show the correct option below in case the user's selection is wrong */}
        <div>
          <Question question={props.stepItem} questionResponse={(props.stepItemSubmission as string[]) || []} onSelectAnswer={props.onSelectAnswer} />
        </div>
      </div>
      {props.nextButtonClicked && !props.allQuestionsAnsweredCorrectly && props.allQuestionsAnswered && (
        <div>
          <h3 className="text-xl font-semibold mb-2 mt-2">Correct Answer</h3> {/* Move the "Correct Answer" heading outside the green border */}
          <div className="border-2 rounded-lg border-green-500 p-4 mt-4">
            <Question
              question={{
                ...props.stepItem,
                uuid: props.stepItem.uuid + '_readonly',
              }}
              hideQuestion={true}
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
