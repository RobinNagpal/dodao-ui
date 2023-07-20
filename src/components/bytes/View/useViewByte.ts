import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteDetailsFragment,
  ByteStepFragment,
  ByteSubmissionInput,
  ByteUserInputFragmentFragment,
  SpaceWithIntegrationsFragment,
  useQueryByteDetailsQuery,
  UserDiscordInfoInput,
  useSubmitByteMutation,
} from '@/graphql/generated/generated-types';

import { isQuestion, isUserDiscordConnect, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { StepItemSubmissionType } from '@/types/deprecated/models/enums';
import { ByteSubmissionError } from '@/types/errors/error';
import { StepItemResponse, StepResponse, TempByteSubmission } from '@/utils/byte/TempByteSubmission';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LAST_STEP_UUID = 'LAST_STEP_UUID';

export function useViewByte(space: SpaceWithIntegrationsFragment, byteId: string, stepOrder: number): UseViewByteHelper {
  const { data: session } = useSession();
  // Replace Vue reactive refs with React state
  const [activeStepOrder, setActiveStepOrder] = useState<number>(0);
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);
  const [byteRef, setByteRef] = useState<ByteDetailsFragment | null>(null);
  const [byteStepsMap, setByteStepsMap] = useState<{ [uuid: string]: ByteStepFragment }>({});
  const [byteSubmitting, setByteSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ByteSubmissionError>({});

  const [byteSubmission, setByteSubmission] = useState<TempByteSubmission>({
    isPristine: true,
    isSubmitted: false,
    stepResponsesMap: {},
  });

  const { refetch } = useQueryByteDetailsQuery({ skip: true });
  const { showNotification } = useNotificationContext();

  const [submitByteMutation] = useSubmitByteMutation();

  async function initialize() {
    setActiveStepOrder(stepOrder);
    const refetchResult = await refetch({ spaceId: space.id, byteId: byteId });

    const byte = refetchResult.data.byte;

    setByteRef({
      ...byte,
      __typename: 'Byte',
      steps: [
        ...byte.steps,
        {
          __typename: 'ByteStep',
          content: 'The byte has been completed successfully!',
          name: 'Completed',
          uuid: LAST_STEP_UUID,
          stepItems: [],
        },
      ],
    });

    if (byteSubmission.isSubmitted) {
      setByteSubmission({
        isPristine: true,
        isSubmitted: false,
        stepResponsesMap: {},
      });
    }

    setByteStepsMap(Object.fromEntries(byte.steps.map((step) => [step.uuid, step])));

    // ...

    setByteSubmission({
      ...byteSubmission,
      stepResponsesMap: Object.fromEntries(
        byte.steps.map((step) => [step.uuid, getStepSubmission(step.uuid) || { itemResponsesMap: {}, isTouched: false, isCompleted: false }])
      ),
    });
    setByteLoaded(true);
  }

  function setActiveStep(order: number) {
    setActiveStepOrder(order);
    history.replaceState(null, '', `/tidbits/view/${byteId}/${order}`);
  }

  function getStepSubmission(stepUuid: string): StepResponse | undefined {
    return byteSubmission.stepResponsesMap?.[stepUuid];
  }

  function getStepItemSubmission(stepUuid: string, stepItemUuid: string): StepItemResponse | undefined {
    const stepSubmission = getStepSubmission(stepUuid);
    return stepSubmission?.itemResponsesMap[stepItemUuid];
  }

  function goToNextStep(currentStep: ByteStepFragment) {
    setActiveStepOrder(activeStepOrder + 1);

    setByteSubmission((prevByteSubmission: any) => {
      return {
        ...prevByteSubmission,
        stepResponsesMap: {
          ...prevByteSubmission.stepResponsesMap,
          [currentStep.uuid]: {
            ...prevByteSubmission.stepResponsesMap[currentStep.uuid],
            isCompleted: true,
            isTouched: true,
          },
        },
      };
    });

    history.replaceState(null, '', `/tidbits/view/${byteId}/${activeStepOrder + 1}`);
  }

  function goToPreviousStep(currentStep: ByteStepFragment) {
    setActiveStepOrder(activeStepOrder - 1);

    history.replaceState(null, '', `/tidbits/view/${byteId}/${activeStepOrder - 1}`);
  }

  function selectAnswer(stepUuid: string, questionUuid: string, selectedAnswers: string[]) {
    updateItemValue(stepUuid, questionUuid, selectedAnswers);
  }

  function setUserInput(stepUuid: string, userInputUuid: string, userInput: string) {
    updateItemValue(stepUuid, userInputUuid, userInput);
  }

  function setUserDiscord(stepUuid: string, userDiscordUuid: string, userDiscordId: string) {
    updateItemValue(stepUuid, userDiscordUuid, userDiscordId);
  }

  function updateItemValue(stepUuid: string, itemUuid: string, itemValue: string | string[]) {
    setByteSubmission((prevByteSubmission: any) => {
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

  function isEverythingInByteIsAnswered() {
    return Object.keys(byteStepsMap).every((stepUuid) => isQuestionAnswered(stepUuid));
  }

  function isValidToSubmit() {
    setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isPristine: false }));
    return isEverythingInByteIsAnswered();
  }
  async function submitByte(): Promise<boolean> {
    setByteSubmitting(true);
    setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isPristine: false }));

    if (!isEverythingInByteIsAnswered()) {
      setByteSubmitting(false);
      setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isPristine: false }));
      return false;
    }

    const byteSubmissionInput: ByteSubmissionInput = {
      space: space.id,
      uuid: uuidv4(),
      byteId: byteId,
      from: session?.username || 'anonymous',
    };

    try {
      const response = await submitByteMutation({
        variables: {
          input: byteSubmissionInput,
        },
      });
      setByteSubmitting(false);
      setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isSubmitted: true }));

      const result = response?.data?.submitByte.id;
      if (result) {
        showNotification({
          type: 'success',
          message: 'Tidbit Submitted',
          heading: 'Success 🎉',
        });

        if (result) {
          const lastStepContent = `The byte has been completed successfully!`;

          const stepsWithoutLastOne = byteRef!.steps.filter((step) => step.uuid !== LAST_STEP_UUID) || [];
          setByteRef({
            ...byteRef!,
            steps: [
              ...stepsWithoutLastOne,
              {
                __typename: 'ByteStep',
                content: lastStepContent,
                name: 'Completed',
                uuid: LAST_STEP_UUID,
                stepItems: [],
              },
            ],
          });

          setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission }));
        }

        return true;
      } else {
        setByteSubmitting(false);
        setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isSubmitted: false }));
        return false;
      }
    } catch (e) {
      console.log(e);
      setByteSubmitting(false);
      setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isSubmitted: false }));
      return false;
    }
  }

  function isQuestionAnswered(stepUuid: string): boolean {
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

  function isUserInputComplete(stepUuid: string) {
    if (stepUuid === LAST_STEP_UUID) return true;
    const step = byteStepsMap[stepUuid];
    if (!step) {
      console.error(`no step with uuid - ${stepUuid} found in`, byteStepsMap);
    }
    const stepSubmission = getStepSubmission(stepUuid);

    const respondedToAllInputs = step.stepItems
      .filter(isUserInput)
      .filter((item) => (item as ByteUserInputFragmentFragment).required)
      .every((userInput) => (stepSubmission?.itemResponsesMap?.[userInput.uuid] as string)?.length);

    return respondedToAllInputs;
  }
  return {
    initialize,
    activeStepOrder,
    errors,
    getStepSubmission,
    getStepItemSubmission,
    goToNextStep,
    goToPreviousStep,
    byteLoaded,
    byteRef: byteRef!,
    byteSubmission,
    byteSubmitting,
    isUserInputComplete,
    isQuestionAnswered,
    isValidToSubmit,
    selectAnswer,
    setActiveStep,
    submitByte,
    setUserInput,
    setUserDiscord,
  };
}

export interface UseViewByteHelper {
  initialize: () => Promise<void>;
  activeStepOrder: number;
  errors: ByteSubmissionError;
  getStepSubmission: (stepUuid: string) => StepResponse | undefined;
  getStepItemSubmission: (stepUuid: string, stepItemUuid: string) => StepItemResponse | undefined;
  goToNextStep: (currentStep: ByteStepFragment) => void;
  goToPreviousStep: (currentStep: ByteStepFragment) => void;
  byteLoaded: boolean;
  byteRef: ByteDetailsFragment;
  byteSubmission: TempByteSubmission;
  byteSubmitting: boolean;
  isUserInputComplete: (stepUuid: string) => boolean;
  isQuestionAnswered: (stepUuid: string) => boolean;
  isValidToSubmit: () => boolean;
  selectAnswer: (stepUuid: string, questionUuid: string, selectedAnswers: string[]) => void;
  setActiveStep: (order: number) => void;
  submitByte: () => Promise<boolean>;
  setUserInput: (stepUuid: string, userInputUuid: string, userInput: string) => void;
  setUserDiscord: (stepUuid: string, userDiscordUuid: string, userDiscordId: string) => void;
}
