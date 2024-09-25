import { checkIfQuestionIsComplete, checkIfUserInputIsComplete, updateItemValue } from '@/components/bytes/View/viewByteHelper';
import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ByteSubmissionInput, SpaceWithIntegrationsFragment, useSubmitByteMutation } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import { ByteSubmissionError } from '@dodao/web-core/types/errors/error';
import { StepItemResponse, StepResponse, TempByteSubmission } from '@/utils/byte/TempByteSubmission';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import union from 'lodash/union';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LAST_STEP_UUID = 'LAST_STEP_UUID';

type GenericByteType = ByteDto;

export interface UseGenericViewByteParams {
  space: SpaceWithIntegrationsFragment;
  fetchByte: () => Promise<GenericByteType>;
  byteDetailsUrl: string;
  byteId: string;
  stepOrder: number;
}
export function useGenericViewByte({ space, fetchByte, byteDetailsUrl, byteId, stepOrder }: UseGenericViewByteParams): UseGenericViewByteHelper {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  // Replace Vue reactive refs with React state
  const [activeStepOrder, setActiveStepOrder] = useState<number>(0);
  const [byteLoaded, setByteLoaded] = useState<boolean>(false);
  const [byteRef, setByteRef] = useState<GenericByteType | null>(null);
  const [byteStepsMap, setByteStepsMap] = useState<{ [uuid: string]: ByteStepDto }>({});
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

    const byte: GenericByteType = await fetchByte();

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

    // ...

    setByteSubmission({
      ...byteSubmission,
      stepResponsesMap: Object.fromEntries(
        byte.steps.map((step) => [
          step.uuid,
          getStepSubmission(step.uuid) || {
            itemResponsesMap: {},
            isTouched: false,
            isCompleted: false,
          },
        ])
      ),
    });
    setByteLoaded(true);
  }

  function setActiveStep(order: number) {
    setActiveStepOrder(order);
    history.replaceState(null, '', `${byteDetailsUrl}/${byteId}/${order}`);
  }

  function getStepSubmission(stepUuid: string): StepResponse | undefined {
    return byteSubmission.stepResponsesMap?.[stepUuid];
  }

  function getStepItemSubmission(stepUuid: string, stepItemUuid: string): StepItemResponse | undefined {
    const stepSubmission = getStepSubmission(stepUuid);
    return stepSubmission?.itemResponsesMap[stepItemUuid];
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

    history.replaceState(null, '', `${byteDetailsUrl}/${byteId}/${activeStepOrder + 1}`);
  }

  function goToPreviousStep(currentStep: ByteStepDto) {
    setActiveStepOrder(activeStepOrder - 1);

    history.replaceState(null, '', `${byteDetailsUrl}/${byteId}/${activeStepOrder - 1}`);
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

          const stepsWithoutLastOne = byteRef!.steps.filter((step: ByteStepDto) => step.uuid !== LAST_STEP_UUID) || [];
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

export interface UseGenericViewByteHelper {
  initialize: () => Promise<void>;
  activeStepOrder: number;
  errors: ByteSubmissionError;
  getStepSubmission: (stepUuid: string) => StepResponse | undefined;
  getStepItemSubmission: (stepUuid: string, stepItemUuid: string) => StepItemResponse | undefined;
  goToNextStep: (currentStep: ByteStepDto) => void;
  goToPreviousStep: (currentStep: ByteStepDto) => void;
  byteLoaded: boolean;
  byteRef: GenericByteType;
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
