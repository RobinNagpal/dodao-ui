import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { ByteStepItem, Question, UserInput } from '@/types/stepItems/stepItemDto';
import { isQuestion, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ByteSubmissionInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import { ByteSubmissionError } from '@dodao/web-core/types/errors/error';
import { StepItemResponse, StepResponse, TempByteSubmission } from '@/utils/byte/TempByteSubmission';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import isEqual from 'lodash/isEqual';
import union from 'lodash/union';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LAST_STEP_UUID = 'LAST_STEP_UUID';

export interface UseViewByteInModalArgs {
  space: SpaceWithIntegrationsFragment;
  byteId: string;
  stepOrder: number;
  fetchByteFn: (byteId: string) => Promise<ByteDto>;
}

export interface UseViewByteHelper {
  initialize: () => Promise<void>;
  activeStepOrder: number;
  canNavigateToNext: (step: ByteStepDto) => boolean;
  isPristine: (stepUuid: string) => boolean;
  errors: ByteSubmissionError;
  getStepSubmission: (stepUuid: string) => StepResponse | undefined;
  getStepItemSubmission: (stepUuid: string, stepItemUuid: string) => StepItemResponse | undefined;
  goToNextStep: (currentStep: ByteStepDto) => void;
  goToPreviousStep: (currentStep: ByteStepDto) => void;
  byteLoaded: boolean;
  byteRef: ByteDto;
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

export function useViewByteInModal({ space, byteId, stepOrder, fetchByteFn }: UseViewByteInModalArgs): UseViewByteHelper {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  // Replace Vue reactive refs with React state
  const [activeStepOrder, setActiveStepOrder] = useState<number>(0);
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);
  const [byteRef, setByteRef] = useState<ByteDto | null>(null);
  const [byteStepsMap, setByteStepsMap] = useState<{ [uuid: string]: ByteStepDto }>({});
  const [byteSubmitting, setByteSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ByteSubmissionError>({});

  const [pristineSteps, setPristineSteps] = useState<{ [stepUuid: string]: boolean }>({});

  const [byteSubmission, setByteSubmission] = useState<TempByteSubmission>({
    isPristine: true,
    isSubmitted: false,
    stepResponsesMap: {},
  });

  const { showNotification } = useNotificationContext();

  async function initialize() {
    setActiveStepOrder(stepOrder);
    const byte = await fetchByteFn(byteId);

    setByteRef({
      ...byte,
      steps: [
        ...byte.steps,
        {
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

  function canNavigateToNext(step: ByteStepDto): boolean {
    const answeredCorrectly = step.stepItems.filter(isQuestion).every((stepItem: ByteStepItem) => {
      const question = stepItem as Question;
      return isEqual(question.answerKeys.sort(), ((getStepItemSubmission(step.uuid, stepItem.uuid) as string[]) || []).sort());
    });

    return isQuestionAnswered(step.uuid) && isUserInputComplete(step.uuid) && answeredCorrectly;
  }

  function isPristine(stepUuid: string) {
    return pristineSteps[stepUuid];
  }

  function goToNextStep(currentStep: ByteStepDto) {
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

  function goToPreviousStep(currentStep: ByteStepDto) {
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
      const response = await fetch(`${getBaseUrl()}/api/byte/submit-byte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionInput: byteSubmissionInput,
        }),
      }).then((res) => res.json());
      setByteSubmitting(false);
      setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isSubmitted: true }));

      const result = response?.submitByte.id;
      if (result) {
        showNotification({
          type: 'success',
          message: "You've successfully submitted this tidbit. Ready for the next one?",
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
    canNavigateToNext,
    isPristine,
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

export function checkIfUserInputIsComplete(
  stepUuid: string,
  byteStepsMap: {
    [p: string]: ByteStepDto;
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
    .filter((item) => (item as UserInput).required)
    .every((userInput) => (stepSubmission?.itemResponsesMap?.[userInput.uuid] as string)?.length);

  return respondedToAllInputs;
}

export function checkIfQuestionIsComplete(
  stepUuid: string,
  byteStepsMap: {
    [p: string]: ByteStepDto;
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
