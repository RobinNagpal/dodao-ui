import guideSubmissionCache from '@/components/guides/View/guideSubmissionCache';
import { StepItemResponse, StepResponse, TempGuideSubmission } from '@/components/guides/View/TempGuideSubmission';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  GuideFragment,
  GuideStepFragment,
  GuideStepItemSubmissionInput,
  GuideStepSubmissionInput,
  GuideSubmissionInput,
  GuideUserInputFragment,
  Space,
  useGuideQueryQuery,
  UserDiscordInfoInput,
  useSubmitGuideMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { StepItemSubmissionType } from '@/types/deprecated/models/enums';
import { GuideSubmissionError } from '@/types/errors/error';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LAST_STEP_UUID = 'LAST_STEP_UUID';

export interface UseViewGuideHelper {
  activeStepOrder: number;
  errors: GuideSubmissionError;
  getStepSubmission: (stepUuid: string) => StepResponse;
  getStepItemSubmission: (stepUuid: string, stepItemUuid: string) => StepItemResponse | undefined;
  goToNextStep: (currentStep: GuideStepFragment) => void;
  goToPreviousStep: (currentStep: GuideStepFragment) => void;
  guideLoaded: boolean;
  guideRef: GuideFragment | null;
  guideSubmission: TempGuideSubmission;
  guideSubmitting: boolean;
  initialize: () => void;
  isEveryQuestionAnsweredInStep: (stepUuid: string) => boolean;
  isValidToSubmit: () => boolean;
  selectAnswer: (stepUuid: string, questionUuid: string, selectedAnswers: string[]) => void;
  setActiveStep: (order: number) => void;
  submitGuide: () => void;
  setUserInput: (stepUuid: string, userInputUuid: string, userInput: string) => void;
  setUserDiscord: (stepUuid: string, userDiscordUuid: string, userDiscordId: string) => void;
}

export function useViewGuide(space: Space, uuid: string, stepOrder: number): UseViewGuideHelper {
  const { $t: t } = useI18();

  const { data: session } = useSession();
  const [guideRef, setGuideRef] = useState<GuideFragment | null>(null);
  const [guideStepsMap, setGuideStepsMap] = useState<{ [uuid: string]: GuideStepFragment }>({});
  const [errors, setErrors] = useState<GuideSubmissionError>({});
  const [guideLoaded, setGuideLoaded] = useState<boolean>(false);
  const [guideSubmittingRef, setGuideSubmittingRef] = useState<boolean>(false);
  const [guideSubmission, setGuideSubmission] = useState<TempGuideSubmission>({
    isPristine: true,
    isSubmitted: false,
    stepResponsesMap: {},
  });
  const [activeStepOrder, setActiveStepOrder] = useState<number>(0);
  const { refetch } = useGuideQueryQuery({ skip: true });
  const [submitGuideMutation] = useSubmitGuideMutation();
  const { showNotification } = useNotificationContext();
  function getStepSubmission(stepUuid: string): StepResponse {
    return guideSubmission.stepResponsesMap?.[stepUuid];
  }

  function getStepItemSubmission(stepUuid: string, stepItemUuid: string): StepItemResponse | undefined {
    return getStepSubmission(stepUuid).itemResponsesMap[stepItemUuid];
  }
  async function initialize() {
    console.log('initialize');
    setActiveStepOrder(stepOrder);
    const result = await refetch({ uuid: uuid });

    const guide = result.data?.guide;

    setGuideRef({
      ...guide,
      __typename: 'Guide',
      steps: [
        ...guide.steps,
        {
          __typename: 'GuideStep',
          content: 'The guide has been completed successfully!',
          name: 'Completed',
          order: guide.steps.length,
          uuid: LAST_STEP_UUID,
          stepItems: [],
          id: 'some_id',
          created: new Date().getTime(),
        },
      ],
    });

    readGuideSubmissions();

    if (guideSubmission.isSubmitted) {
      guideSubmissionCache.deleteGuideSubmission(uuid);
      setGuideSubmission({
        isPristine: true,
        isSubmitted: false,
        stepResponsesMap: {},
      });
    }

    setGuideStepsMap(Object.fromEntries<GuideStepFragment>(guide.steps.map((step) => [step.uuid, step])));

    // This just sets submission data for every step
    setGuideSubmission((prev) => ({
      ...prev,
      stepResponsesMap: Object.fromEntries(
        guide.steps.map((step) => [step.uuid, getStepSubmission(step.uuid) || { itemResponsesMap: {}, isTouched: false, isCompleted: false }])
      ),
    }));
  }
  function setActiveStep(order: number) {
    setActiveStepOrder(order);
    history.replaceState(null, '', `/guides/view/${uuid}/${order}`);
  }

  function goToNextStep(currentStep: GuideStepFragment) {
    getStepSubmission(currentStep.uuid).isCompleted = true;
    const newStepOrder = currentStep.order + 1;
    setActiveStepOrder(newStepOrder);
    const navigateToLastStep = activeStepOrder === (guideRef?.steps || []).length - 1;

    if (!navigateToLastStep) {
      saveGuideSubmissionToLocalStorage();
    }

    history.replaceState(null, '', `/guides/view/${uuid}/${newStepOrder}`);
  }

  function goToPreviousStep(currentStep: GuideStepFragment) {
    const newStepOrder = currentStep.order - 1;
    setActiveStepOrder(newStepOrder);
    saveGuideSubmissionToLocalStorage();
    history.replaceState(null, '', `/guides/view/${uuid}/${newStepOrder}`);
  }

  function saveGuideSubmissionToLocalStorage() {
    guideSubmissionCache.saveGuideSubmission(uuid, guideSubmission);
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
    setGuideSubmission({
      ...guideSubmission,
      stepResponsesMap: {
        ...guideSubmission.stepResponsesMap,
        [stepUuid]: {
          ...guideSubmission.stepResponsesMap?.[stepUuid],
          itemResponsesMap: {
            ...guideSubmission.stepResponsesMap?.[stepUuid]?.itemResponsesMap,
            [itemUuid]: itemValue,
          },
        },
      },
    });
    saveGuideSubmissionToLocalStorage();
  }

  function isEverythingInGuideIsAnswered(): boolean {
    return Object.keys(guideStepsMap.value).every((stepUuid) => isEveryQuestionAnsweredInStep(stepUuid));
  }

  function isValidToSubmit() {
    setGuideSubmission({
      ...guideSubmission,
      isPristine: false,
    });

    return isEverythingInGuideIsAnswered();
  }
  async function submitGuide() {
    setGuideSubmittingRef(true);

    setGuideSubmission({
      ...guideSubmission,
      isPristine: false,
    });

    const responses = guideSubmission.stepResponsesMap;

    if (!isEverythingInGuideIsAnswered()) {
      setGuideSubmittingRef(false);
      return;
    }

    const guideSubmissionInput: Omit<GuideSubmissionInput, 'timestamp'> = {
      space: space.id,
      uuid: uuidv4(),
      guideUuid: uuid,
      from: session?.username || '',
      steps: Object.keys(responses).map((stepUuid): GuideStepSubmissionInput => {
        const stepResponse: undefined | StepResponse = responses[stepUuid];

        return {
          uuid: stepUuid,
          itemResponses: Object.keys(stepResponse.itemResponsesMap).map((itemUuid): GuideStepItemSubmissionInput => {
            const stepItem = guideStepsMap[stepUuid]?.stepItems.find((item) => item.uuid === itemUuid)!;
            const stepItemResponse: StepItemResponse = stepResponse.itemResponsesMap[itemUuid];
            if (isUserInput(stepItem)) {
              return {
                uuid: itemUuid,
                userInput: stepItemResponse as string,
                type: StepItemSubmissionType.UserInput,
              };
            } else if (isUserDiscordConnect(stepItem)) {
              return {
                uuid: itemUuid,
                userDiscordInfo: stepItemResponse as UserDiscordInfoInput,
                type: StepItemSubmissionType.UserDiscordConnect,
              };
            } else {
              return {
                uuid: itemUuid,
                selectedAnswerKeys: stepItemResponse as string[],
                type: StepItemSubmissionType.Question,
              };
            }
          }),
        };
      }),
    };

    try {
      const response = await submitGuideMutation({ variables: { input: guideSubmissionInput } });

      setGuideSubmittingRef(false);
      setGuideSubmission({
        ...guideSubmission,
        isSubmitted: true,
      });
      const result = response?.data?.payload.result;
      if (result) {
        showNotification({
          type: 'success',
          message: 'Guide Submitted',
          heading: 'Success 🎉',
        });

        if (result) {
          console.log('result', result);
          // guideSubmissionCache.deleteGuideSubmission(uuid);
          const lastStepContent = `
      The guide has been completed successfully!
      
      You got ${result.correctQuestions.length} correct out of ${result.allQuestions.length} questions
      `;

          const stepsWithoutLastOne = guideRef?.steps?.filter((step) => step.uuid !== LAST_STEP_UUID) || [];
          setGuideRef({
            ...guideRef!,
            showIncorrectOnCompletion: !!guideRef?.showIncorrectOnCompletion,
            steps: [
              ...stepsWithoutLastOne,
              {
                __typename: 'GuideStep',
                content: lastStepContent,
                name: 'Completed',
                order: stepsWithoutLastOne.length,
                uuid: LAST_STEP_UUID,
                stepItems: [],
                id: 'some_id',
                created: new Date().getTime(),
              },
            ],
          });
        }

        setGuideSubmission({
          ...guideSubmission,
          submissionResult: result,
          galaxyCredentialsUpdated: !!response?.data?.payload?.galaxyCredentialsUpdated,
        });
        guideSubmissionCache.saveGuideSubmission(uuid, guideSubmission);

        return true;
      } else {
        setGuideSubmittingRef(false);
        setGuideSubmission({
          ...guideSubmission,
          isSubmitted: false,
        });
        return false;
      }
    } catch (e) {
      console.log(e);
      setGuideSubmittingRef(false);
      setGuideSubmission({
        ...guideSubmission,
        isSubmitted: false,
      });
      return false;
    }
  }

  function isEveryQuestionAnsweredInStep(stepUuid: string): boolean {
    if (stepUuid === LAST_STEP_UUID) return true;
    const step = guideStepsMap[stepUuid];
    if (!step) {
      console.error(`no step with uuid - ${stepUuid} found in`, guideStepsMap);
    }
    const stepSubmission = getStepSubmission(stepUuid);

    const allQuestionsAnswered = step.stepItems
      .filter(isQuestion)
      .every((question) => (stepSubmission?.itemResponsesMap?.[question.uuid] as string[] | undefined)?.length);

    const allRequiredFieldsAnswered = step.stepItems
      .filter(isUserInput)
      .filter((input) => (input as GuideUserInputFragment).required)
      .every((userInput) => !!(stepSubmission?.itemResponsesMap?.[userInput.uuid] as string)?.trim());

    return allQuestionsAnswered && allRequiredFieldsAnswered;
  }

  function readGuideSubmissions() {
    const answerCache = guideSubmissionCache.readGuideSubmissionsCache(uuid);
    if (answerCache) {
      setGuideSubmission({
        ...guideSubmission,
        ...(answerCache || {}),
      });
    }
  }

  return {
    initialize,
    activeStepOrder,
    errors,
    getStepSubmission: getStepSubmission,
    getStepItemSubmission,
    goToNextStep,
    goToPreviousStep,
    guideLoaded,
    guideRef: guideRef,
    guideSubmission,
    guideSubmitting: guideSubmittingRef,
    isEveryQuestionAnsweredInStep,
    isValidToSubmit,
    selectAnswer,
    setActiveStep,
    submitGuide,
    setUserInput,
    setUserDiscord,
  };
}
