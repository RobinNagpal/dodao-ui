import { LAST_STEP_UUID } from '@/components/bytes/View/useViewByte';
import { ByteStepFragment, ByteUserInputFragmentFragment } from '@/graphql/generated/generated-types';
import { isQuestion, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { StepResponse, TempByteSubmission } from '@/utils/byte/TempByteSubmission';

export function checkIfUserInputIsComplete(
  stepUuid: string,
  byteStepsMap: {
    [p: string]: ByteStepFragment;
  },
  getStepSubmission: (stepUuid: string) => StepResponse | undefined
) {
  if (stepUuid === LAST_STEP_UUID) return true;
  const step = byteStepsMap[stepUuid];
  const stepSubmission = getStepSubmission(stepUuid);
  if (!step) {
    console.error(`no step with uuid - ${stepUuid} found in`, byteStepsMap);
  }

  const respondedToAllInputs = step.stepItems
    .filter(isUserInput)
    .filter((item) => (item as ByteUserInputFragmentFragment).required)
    .every((userInput) => (stepSubmission?.itemResponsesMap?.[userInput.uuid] as string)?.length);

  return respondedToAllInputs;
}

export function checkIfQuestionIsComplete(
  stepUuid: string,
  byteStepsMap: {
    [p: string]: ByteStepFragment;
  },
  getStepSubmission: (stepUuid: string) => StepResponse | undefined
) {
  if (stepUuid === LAST_STEP_UUID) return true;
  const step = byteStepsMap[stepUuid];
  if (!step) {
    console.error(`no step with uuid - ${stepUuid} found in`, byteStepsMap);
  }
  const stepSubmission = getStepSubmission(stepUuid);

  const allQuestionsAnswered = step.stepItems
    .filter(isQuestion)
    .every((question) => (stepSubmission?.itemResponsesMap?.[question.uuid] as string[] | undefined)?.length);

  return allQuestionsAnswered;
}

export function updateItemValue(
  stepUuid: string,
  itemUuid: string,
  itemValue: string | string[],
  setByteSubmission: (fn: (submission: TempByteSubmission) => TempByteSubmission) => void
) {
  setByteSubmission((prevByteSubmission: TempByteSubmission) => {
    return {
      ...prevByteSubmission,
      stepResponsesMap: {
        ...prevByteSubmission.stepResponsesMap,
        [stepUuid]: {
          ...prevByteSubmission.stepResponsesMap?.[stepUuid],
          itemResponsesMap: {
            ...prevByteSubmission.stepResponsesMap?.[stepUuid]?.itemResponsesMap,
            [itemUuid]: itemValue,
          },
        },
      },
    };
  });
}
