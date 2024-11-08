import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { ByteStepItem, Question, UserInput } from '@/types/stepItems/stepItemDto';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ByteSubmissionInput, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import { ByteSubmissionError } from '@dodao/web-core/types/errors/error';
import { ByteStepItemResponse, ByteStepResponse, TempByteSubmission } from '@/utils/byte/TempByteSubmission';
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
  isStepTouched: (stepUuid: string) => boolean;
  errors: ByteSubmissionError;
  getStepSubmission: (stepUuid: string) => ByteStepResponse | undefined;
  getStepItemSubmission: (stepUuid: string, stepItemUuid: string) => ByteStepItemResponse | undefined;
  goToNextStep: (currentStep: ByteStepDto) => void;
  goToPreviousStep: (currentStep: ByteStepDto) => void;
  byteLoaded: boolean;
  byteRef: ByteDto;
  byteSubmission: TempByteSubmission;
  byteSubmitting: boolean;
  isUserInputComplete: (stepUuid: string) => boolean;
  isQuestionAnswered: (stepUuid: string) => boolean;
  isQuestionAnsweredCorrectly: (stepUuid: string) => boolean;
  hasQuestion: (stepUuid: string) => boolean;
  isDiscordConnected: (stepUuid: string) => boolean;
  isValidToSubmit: () => boolean;
  selectAnswer: (stepUuid: string, questionUuid: string, selectedAnswers: string[]) => void;
  setActiveStep: (order: number) => void;
  submitByte: () => Promise<boolean>;
  setUserInput: (stepUuid: string, userInputUuid: string, userInput: string) => void;
  setUserDiscord: (stepUuid: string, userDiscordUuid: string, userDiscordId: string) => void;
}

export function useViewByteHelper({ space, byteId, stepOrder, fetchByteFn }: UseViewByteInModalArgs): UseViewByteHelper {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  // Replace Vue reactive refs with React state
  const [activeStepOrder, setActiveStepOrder] = useState<number>(0);
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);
  const [byteRef, setByteRef] = useState<ByteDto | null>(null);
  const [byteStepsMap, setByteStepsMap] = useState<{ [uuid: string]: ByteStepDto }>({});
  const [byteSubmitting, setByteSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ByteSubmissionError>({});

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

  function getStepSubmission(stepUuid: string): ByteStepResponse | undefined {
    return byteSubmission.stepResponsesMap?.[stepUuid];
  }

  function getStepItemSubmission(stepUuid: string, stepItemUuid: string): ByteStepItemResponse | undefined {
    const stepSubmission = getStepSubmission(stepUuid);
    return stepSubmission?.itemResponsesMap[stepItemUuid];
  }

  function isPristine(stepUuid: string) {
    return byteSubmission.stepResponsesMap[stepUuid]?.isTouched;
  }

  function canNavigateToNext(step: ByteStepDto): boolean {
    if (byteSubmission.stepResponsesMap[step.uuid]) {
      byteSubmission.stepResponsesMap[step.uuid].isTouched = true;
    } else {
      byteSubmission.stepResponsesMap[step.uuid] = { isTouched: true, isCompleted: false, itemResponsesMap: {} };
    }

    if (!byteRef) return false;

    const answeredCorrectly = step.stepItems.filter(isQuestion).every((stepItem: ByteStepItem) => {
      const question = stepItem as Question;
      return isEqual(question.answerKeys.sort(), ((getStepItemSubmission(step.uuid, stepItem.uuid) as string[]) || []).sort());
    });

    if (!isQuestionAnswered(step.uuid) || !answeredCorrectly) {
      showNotification({
        type: 'info',
        message: 'Your answer is wrong! Give correct answer to proceed.',
        heading: 'Hint',
      });
      return false;
    }

    if (!isUserInputComplete(step.uuid)) {
      showNotification({
        type: 'info',
        message: 'Please provide the required information to proceed.',
        heading: 'Hint',
      });
      return false;
    }

    const isLastStep = byteRef.steps.length - 2 === activeStepOrder;

    if (isLastStep) {
      if (!isValidToSubmit()) {
        return false;
      }
    }

    return true;
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
    updateItemValue(stepUuid, questionUuid, selectedAnswers);
  }

  function setUserInput(stepUuid: string, userInputUuid: string, userInput: string) {
    updateItemValue(stepUuid, userInputUuid, userInput);
  }

  function setUserDiscord(stepUuid: string, userDiscordUuid: string, userDiscordId: string) {
    updateItemValue(stepUuid, userDiscordUuid, userDiscordId);
  }

  function updateItemValue(stepUuid: string, itemUuid: string, itemValue: string | string[]) {
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

  function isEverythingInByteIsAnswered() {
    return Object.keys(byteStepsMap).every((stepUuid) => isQuestionAnswered(stepUuid));
  }

  function isValidToSubmit() {
    setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isPristine: false }));
    return isEverythingInByteIsAnswered();
  }
  async function submitByte(): Promise<boolean> {
    if (byteSubmission.isSubmitted || byteId.startsWith('0001-demo-byte')) return true;

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
          message: "You've successfully completed this tidbit. Ready for the next one?",
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

          setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isSubmitted: true }));
        }

        return true;
      } else {
        showNotification({
          type: 'error',
          message: 'The Byte was not saved. Please try again.',
          heading: 'Error',
        });

        setByteSubmitting(false);
        setByteSubmission((prevByteSubmission) => ({ ...prevByteSubmission, isSubmitted: false }));
        return false;
      }
    } catch (e) {
      console.log(e);
      showNotification({
        type: 'error',
        message: 'The Byte was not saved. Please try again.',
        heading: 'Error',
      });

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

  function isQuestionAnsweredCorrectly(stepUuid: string): boolean {
    const step = byteStepsMap[stepUuid];
    if (!step) {
      console.error(`no step with uuid - ${stepUuid} found in`, byteStepsMap);
      return false;
    }
    const stepSubmission = getStepSubmission(stepUuid);
    if (!stepSubmission) return false;

    const allQuestionsAnswered = step.stepItems.filter(isQuestion).every((question) => {
      const questionResponse = stepSubmission?.itemResponsesMap?.[question.uuid] as string[] | undefined;
      if (!questionResponse) return false;
      return isEqual((question as Question).answerKeys.sort(), questionResponse.sort());
    });

    return allQuestionsAnswered;
  }

  function hasQuestion(stepUuid: string): boolean {
    return byteStepsMap[stepUuid]?.stepItems?.some(isQuestion);
  }

  function isUserInputComplete(stepUuid: string) {
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

  function isDiscordConnected(uuid: string): boolean {
    const step = byteRef!.steps.find((step) => step.uuid === uuid)!;
    const hasDiscordConnect = step.stepItems.find(isUserDiscordConnect);
    if (!hasDiscordConnect) return true;
    return !!getStepItemSubmission(step.uuid, hasDiscordConnect.uuid);
  }

  return {
    initialize,
    activeStepOrder,
    canNavigateToNext,
    isStepTouched: isPristine,
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
    isQuestionAnsweredCorrectly,
    hasQuestion,
    isValidToSubmit,
    selectAnswer,
    setActiveStep,
    submitByte,
    setUserInput,
    setUserDiscord,
    isDiscordConnected,
  };
}
