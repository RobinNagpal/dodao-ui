import guideSubmissionCache from '@/components/guides/View/guideSubmissionCache';
import { StepItemResponse, StepResponse, TempGuideSubmission } from '@/components/guides/View/TempGuideSubmission';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  GuideFragment,
  GuideStepFragment,
  GuideStepItemSubmissionInput,
  GuideStepSubmissionInput,
  GuideSubmissionInput,
  GuideUserInputFragment,
  Space,
  UserDiscordInfoInput,
  useSubmitGuideMutation,
} from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { StepItemSubmissionType } from '@dodao/web-core/types/deprecated/models/enums';
import { GuideSubmissionError } from '@dodao/web-core/types/errors/error';
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
  guide: GuideFragment | null;
  guideSubmission: TempGuideSubmission;
  guideSubmitting: boolean;
  initialize: () => void;
  isEveryQuestionAnsweredInStep: (stepUuid: string) => boolean;
  isValidToSubmit: () => boolean;
  selectAnswer: (stepUuid: string, questionUuid: string, selectedAnswers: string[]) => void;
  setActiveStep: (order: number) => void;
  submitGuide: () => Promise<boolean>;
  setUserInput: (stepUuid: string, userInputUuid: string, userInput: string) => void;
  setUserDiscord: (stepUuid: string, userDiscordUuid: string, userDiscordId: string) => void;
}

export function useViewGuide(space: Space, fetchedGuide: GuideFragment, stepOrder: number): UseViewGuideHelper {
  const uuid = fetchedGuide.uuid;

  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const [guide, setGuide] = useState<GuideFragment | null>(null);
  const [guideStepsMap, setGuideStepsMap] = useState<{ [uuid: string]: GuideStepFragment }>({});
  const [errors, setErrors] = useState<GuideSubmissionError>({});
  const [guideLoaded, setGuideLoaded] = useState<boolean>(false);
  const [guideSubmittingRef, setGuideSubmittingRef] = useState<boolean>(false);
  const [guideSubmission, setGuideSubmissionState] = useState<TempGuideSubmission>({
    isPristine: true,
    isSubmitted: false,
    stepResponsesMap: {},
  });
  const [activeStepOrder, setActiveStepOrder] = useState<number>(stepOrder);

  const [submitGuideMutation] = useSubmitGuideMutation();
  const { showNotification } = useNotificationContext();
  function getStepSubmission(stepUuid: string): StepResponse {
    return guideSubmission.stepResponsesMap?.[stepUuid];
  }

  function setGuideSubmission(callback: (tempSubmission?: TempGuideSubmission) => TempGuideSubmission) {
    setGuideSubmissionState((prevState) => {
      const newState = callback(prevState);
      guideSubmissionCache.saveGuideSubmission(uuid, newState);
      return newState;
    });
  }

  function getStepItemSubmission(stepUuid: string, stepItemUuid: string): StepItemResponse | undefined {
    return getStepSubmission(stepUuid)?.itemResponsesMap?.[stepItemUuid];
  }
  async function initialize() {
    setGuide({
      ...fetchedGuide,
      __typename: 'Guide',
      steps: [
        ...fetchedGuide.steps,
        {
          __typename: 'GuideStep',
          content: 'The guide has been completed successfully!',
          name: 'Completed',
          order: fetchedGuide.steps.length,
          uuid: LAST_STEP_UUID,
          stepItems: [],
          id: 'some_id',
        },
      ],
    });

    setGuideLoaded(true);

    setGuideStepsMap(Object.fromEntries<GuideStepFragment>(fetchedGuide.steps.map((step) => [step.uuid, step])));

    const newStepResponseMap = Object.fromEntries(
      fetchedGuide.steps.map((step) => [
        step.uuid,
        getStepSubmission(step.uuid) || {
          itemResponsesMap: {},
          isTouched: false,
          isCompleted: false,
        },
      ])
    );

    const guideSubmissionsFromCache = guideSubmissionCache.readGuideSubmissionsCache(uuid);
    if (guideSubmissionsFromCache) {
      if (guideSubmissionsFromCache.isSubmitted) {
        guideSubmissionCache.deleteGuideSubmission(uuid);
        setGuideSubmission(() => ({
          isPristine: true,
          isSubmitted: false,
          stepResponsesMap: newStepResponseMap,
        }));
      } else {
        setGuideSubmission(() => guideSubmissionsFromCache);
      }
    } else {
      setGuideSubmission(() => ({
        isPristine: true,
        isSubmitted: false,
        stepResponsesMap: newStepResponseMap,
      }));
    }
  }
  function setActiveStep(order: number) {
    setActiveStepOrder(order);
    history.replaceState(null, '', `/guides/view/${uuid}/${order}`);
  }

  function goToNextStep(currentStep: GuideStepFragment) {
    setGuideSubmission((tempSubmission) => {
      const prev = tempSubmission as TempGuideSubmission;
      return {
        ...prev,
        stepResponsesMap: {
          ...prev.stepResponsesMap,
          [currentStep.uuid]: {
            ...prev.stepResponsesMap[currentStep.uuid],
            isCompleted: true,
          },
        },
      };
    });

    const newStepOrder = currentStep.order + 1;
    setActiveStepOrder(newStepOrder);
    history.replaceState(null, '', `/guides/view/${uuid}/${newStepOrder}`);
  }

  function goToPreviousStep(currentStep: GuideStepFragment) {
    const newStepOrder = currentStep.order - 1;
    setActiveStepOrder(newStepOrder);
    history.replaceState(null, '', `/guides/view/${uuid}/${newStepOrder}`);
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
    setGuideSubmission((tempSubmission) => {
      const prev = tempSubmission as TempGuideSubmission;
      return {
        ...prev,
        stepResponsesMap: {
          ...prev.stepResponsesMap,
          [stepUuid]: {
            ...guideSubmission.stepResponsesMap?.[stepUuid],
            itemResponsesMap: {
              ...guideSubmission.stepResponsesMap?.[stepUuid]?.itemResponsesMap,
              [itemUuid]: itemValue,
            },
          },
        },
      };
    });
  }

  function isEverythingInGuideIsAnswered(): boolean {
    return Object.keys(guideStepsMap).every((stepUuid) => isEveryQuestionAnsweredInStep(stepUuid));
  }

  function isValidToSubmit() {
    setGuideSubmission((tempSubmission) => {
      const prev = tempSubmission as TempGuideSubmission;
      return {
        ...prev,
        isPristine: false,
      };
    });

    return isEverythingInGuideIsAnswered();
  }
  async function submitGuide(): Promise<boolean> {
    setGuideSubmittingRef(true);

    const responses = guideSubmission.stepResponsesMap;

    if (!isEverythingInGuideIsAnswered() || !isValidToSubmit()) {
      setGuideSubmittingRef(false);
      return false;
    }

    const guideSubmissionInput: Omit<GuideSubmissionInput, 'timestamp'> = {
      space: space.id,
      uuid: uuidv4(),
      guideUuid: uuid,
      from: session?.username || 'anonymous',
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
      const response = await submitGuideMutation({ variables: { input: guideSubmissionInput }, errorPolicy: 'all' });

      setGuideSubmittingRef(false);
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

          const stepsWithoutLastOne = guide?.steps?.filter((step) => step.uuid !== LAST_STEP_UUID) || [];
          setGuide({
            ...guide!,
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
              },
            ],
          });
        }

        setGuideSubmission((tempSubmission) => {
          const prev = tempSubmission as TempGuideSubmission;
          return {
            ...prev,
            isSubmitted: true,
            submissionResult: result,
            galaxyCredentialsUpdated: !!response?.data?.payload?.galaxyCredentialsUpdated,
          };
        });

        return true;
      } else {
        setGuideSubmittingRef(false);
        return false;
      }
    } catch (e) {
      console.log(e);
      setGuideSubmittingRef(false);
    }

    return false;
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

  return {
    initialize,
    activeStepOrder,
    errors,
    getStepSubmission: getStepSubmission,
    getStepItemSubmission,
    goToNextStep,
    goToPreviousStep,
    guideLoaded,
    guide: guide,
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
