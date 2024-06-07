import { checkIfQuestionIsComplete, checkIfUserInputIsComplete, updateItemValue } from '@/components/bytes/View/viewByteHelper';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteDetailsFragment,
  ByteStepFragment,
  ByteSubmissionInput,
  ProjectByteFragment,
  SpaceWithIntegrationsFragment,
  useSubmitByteMutation,
} from '@/graphql/generated/generated-types';
import { LocalStorageKeys } from '@/types/deprecated/models/enums';
import { ByteSubmissionError } from '@/types/errors/error';
import { StepItemResponse, StepResponse, TempByteSubmission } from '@/utils/byte/TempByteSubmission';
import union from 'lodash/union';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LAST_STEP_UUID = 'LAST_STEP_UUID';

export interface UseViewByteInModalArgs {
  space: SpaceWithIntegrationsFragment;
  byteId: string;
  stepOrder: number;
  fetchByteFn: (byteId: string) => Promise<ByteDetailsFragment | ProjectByteFragment>;
}
export function useViewByteInModal({ space, byteId, stepOrder, fetchByteFn }: UseViewByteInModalArgs): UseViewByteHelper {
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

  const { showNotification } = useNotificationContext();

  const [submitByteMutation] = useSubmitByteMutation();

  async function initialize() {
    setActiveStepOrder(stepOrder);
    const byte = await fetchByteFn(byteId);

    setByteRef({
      ...byte,
      __typename: 'Byte',
      steps: [
        ...byte.steps,
        {
          __typename: 'ByteStep',
          content: 'The Tidbit has been completed successfully!',
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
  }

  function goToPreviousStep(currentStep: ByteStepFragment) {
    setActiveStepOrder(activeStepOrder - 1);
  }

  function selectAnswer(stepUuid: string, questionUuid: string, selectedAnswers: string[]) {
    updateItemValue(stepUuid, questionUuid, selectedAnswers, setByteSubmission);
  }

  function setUserInput(stepUuid: string, userInputUuid: string, userInput: string) {
    updateItemValue(stepUuid, userInputUuid, userInput, setByteSubmission);
  }

  function setUserDiscord(stepUuid: string, userDiscordUuid: string, userDiscordId: string) {
    updateItemValue(stepUuid, userDiscordUuid, userDiscordId, setByteSubmission);
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
          const lastStepContent = `The tidbit has been completed successfully!`;

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

          localStorage.setItem(
            LocalStorageKeys.COMPLETED_TIDBITS,
            JSON.stringify(union([...JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_TIDBITS) || '[]'), byteId]))
          );

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
    return checkIfQuestionIsComplete(stepUuid, byteStepsMap, getStepSubmission);
  }

  function isUserInputComplete(stepUuid: string) {
    return checkIfUserInputIsComplete(stepUuid, byteStepsMap, getStepSubmission);
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
