import Question from '@/components/app/Common/Question';
import UserDiscord from '@/components/app/Form/UserDiscord';
import UserInput from '@/components/app/Form/UserInput';
import Button from '@/components/core/buttons/Button';
import { LAST_STEP_UUID, UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import {
  GuideFragment,
  GuideQuestionFragment,
  GuideStepFragment,
  GuideUserDiscordConnectFragment,
  GuideUserInputFragment,
  Space,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

const StepContent = styled.div.attrs(() => ({
  className: 'step-content markdown-body',
}))`
  li {
    @apply mb-2;
  }
  p {
    @apply mb-4;
  }
  iframe {
    @apply my-8;
  }
`;

const BadgeHeading = styled.h3`
  @apply font-bold;
`;

const BadgeClaimLink = styled.a`
  @apply font-bold text-primary underline;
`;

const CorrectAnswer = styled.div`
  background-color: green !important;
  border-color: green !important;
  &:after {
    background-color: green !important;
  }
`;

const WrongAnswer = styled.div`
  background-color: red !important;
  border-color: red !important;
  &:after {
    background-color: red;
  }
`;

export interface GuideStepProps {
  viewGuideHelper: UseViewGuideHelper;
  space: Space;
  step: GuideStepFragment;
  guide: GuideFragment;
  submitGuide: () => Promise<void>;
}

const GuideStep: React.FC<GuideStepProps> = ({ viewGuideHelper, space, step, guide, submitGuide }) => {
  const [nextButtonClicked, setNextButtonClicked] = useState(false);

  const setUserInput = useCallback(
    (userInputUuid: string, userInput: string) => {
      viewGuideHelper.setUserInput(step.uuid, userInputUuid, userInput);
    },
    [viewGuideHelper, step.uuid]
  );

  const selectAnswer = useCallback(
    (questionId: string, selectedAnswers: string[]) => {
      viewGuideHelper.selectAnswer(step.uuid, questionId, selectedAnswers);
    },
    [viewGuideHelper, step.uuid]
  );

  const [renderIncorrectQuestions, setRenderIncorrectQuestions] = useState(false);

  const stepItems = step.stepItems;
  const guideSubmission = viewGuideHelper.guideSubmission;

  const wrongQuestions = useMemo(() => {
    return guide.steps.reduce<GuideQuestionFragment[]>((wrongQuestions: GuideQuestionFragment[], guideStep: GuideStepFragment) => {
      const wrongOnes: GuideQuestionFragment[] =
        (step.stepItems
          .filter((item) => isQuestion(item))
          .filter((item) => guideSubmission.submissionResult?.wrongQuestions?.includes(item.uuid)) as GuideQuestionFragment[]) || [];

      return [...wrongQuestions, ...wrongOnes];
    }, new Array<GuideQuestionFragment>());
  }, [step]);

  const renderer = getMarkedRenderer();

  const stepContents = marked.parse(step.content, { renderer });

  const postSubmissionContent = useMemo(
    () => (guide.postSubmissionStepContent ? marked.parse(guide.postSubmissionStepContent, { renderer }) : null),
    [guide.postSubmissionStepContent, renderer]
  );

  const [completeButtonClicked, setCompleteButtonClicked] = useState(false);
  const [showCompleteAllQuestionsInTheGuide, setShowCompleteAllQuestionsInTheGuide] = useState(false);

  function isDiscordConnected(): boolean {
    const hasDiscordConnect = step.stepItems.find(isUserDiscordConnect);
    if (!hasDiscordConnect) return true;
    return !!viewGuideHelper.getStepItemSubmission(step.uuid, hasDiscordConnect.uuid);
  }

  function isEveryQuestionAnswered() {
    return viewGuideHelper.isEveryQuestionAnsweredInStep(step.uuid);
  }

  const showQuestionsCompletionWarning = useMemo<boolean>(() => {
    return nextButtonClicked && (!isEveryQuestionAnswered() || !isDiscordConnected());
  }, [nextButtonClicked, step]);

  const isNotFirstStep = step.order !== 0;

  const isLastStep = guide.steps.length - 2 === step.order;

  const isGuideCompletedStep = step.uuid === LAST_STEP_UUID;

  const showIncorrectQuestions = useMemo(
    () =>
      isGuideCompletedStep &&
      guide.showIncorrectOnCompletion &&
      guideSubmission.submissionResult?.allQuestions.length &&
      guideSubmission.submissionResult?.correctQuestions.length < guideSubmission.submissionResult?.allQuestions.length,
    [guide, guideSubmission]
  );

  const navigateToNextStep = () => {
    setNextButtonClicked(true);
    setShowCompleteAllQuestionsInTheGuide(false);

    if (isEveryQuestionAnswered() && isDiscordConnected()) {
      setNextButtonClicked(true);
    }
    submitGuide();
  };

  return (
    <div className="guide-stepper-content w-full px-4 flex flex-col justify-between">
      <StepContent dangerouslySetInnerHTML={{ __html: step.content }} />
      {step.stepItems.map((item, index) => {
        return (
          // Make sure to replace these components with their actual counterparts in your React codebase.
          <div key={item.uuid}>
            {isQuestion(item) && (
              <Question
                question={item as GuideQuestionFragment}
                questionResponse={(viewGuideHelper.getStepItemSubmission(step.uuid, item.uuid) as []) || []}
                onSelectAnswer={selectAnswer}
              />
            )}
            {isUserDiscordConnect(item) && (
              <UserDiscord
                userDiscord={item as GuideUserDiscordConnectFragment}
                discordResponse={viewGuideHelper.getStepItemSubmission(step.uuid, item.uuid) as UserDiscordInfoInput}
                spaceId={space.id}
                guideUuid={guide.id}
                stepUuid={step.uuid}
                stepOrder={viewGuideHelper.activeStepOrder}
              />
            )}
            {isUserInput(item) && (
              <UserInput
                userInput={item as GuideUserInputFragment}
                modelValue={viewGuideHelper.getStepItemSubmission(step.uuid, item.uuid) as string}
                setUserInput={setUserInput}
              />
            )}
          </div>
        );
      })}
      <div>
        <Button onClick={navigateToNextStep} disabled={nextButtonClicked} loading={nextButtonClicked}>
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default GuideStep;
