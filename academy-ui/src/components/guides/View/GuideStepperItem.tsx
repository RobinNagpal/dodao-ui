import Question from '@/components/app/Common/Question';
import UserDiscord from '@/components/app/Form/UserDiscord';
import { LAST_STEP_UUID, UseViewGuideHelper } from '@/components/guides/View/useViewGuide';
import {
  GuideFragment,
  GuideQuestionFragment,
  GuideStepFragment,
  GuideUserDiscordConnectFragment,
  GuideUserInputFragment,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import UserInput from '@dodao/web-core/components/app/Form/UserInput';
import Button from '@dodao/web-core/components/core/buttons/Button';
import ErrorWithAccentBorder from '@dodao/web-core/components/core/errors/ErrorWithAccentBorder';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import flatten from 'lodash/flatten';
import { marked } from 'marked';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'plyr/dist/plyr.css';
import styles from './GuideStepperItem.module.scss';

export interface GuideStepProps {
  space: SpaceWithIntegrationsDto;
  guide: GuideFragment;
  step: GuideStepFragment;
  viewGuideHelper: UseViewGuideHelper;
}

const GuideStep: React.FC<GuideStepProps> = ({ viewGuideHelper, space, step, guide }) => {
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
    const questionFragments = flatten(guide.steps.map((s) => s.stepItems)).filter((item) =>
      guideSubmission.submissionResult?.wrongQuestions?.includes(item.uuid)
    ) as GuideQuestionFragment[];

    return questionFragments;
  }, [guide, guideSubmission]);

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

  const isNotFirstStep = step.stepOrder !== 0;

  const isLastStep = guide.steps.length - 2 === step.stepOrder;

  const isGuideCompletedStep = step.uuid === LAST_STEP_UUID;

  const showIncorrectQuestions = useMemo(
    () =>
      isGuideCompletedStep &&
      guideSubmission.submissionResult?.allQuestions.length &&
      guideSubmission.submissionResult?.correctQuestions.length < guideSubmission.submissionResult?.allQuestions.length,
    [guide, guideSubmission]
  );

  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const { setShowLoginModal } = useLoginModalContext();
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();
  const navigateToNextStep = async () => {
    setNextButtonClicked(true);
    setShowCompleteAllQuestionsInTheGuide(false);

    if (isEveryQuestionAnswered() && isDiscordConnected()) {
      setNextButtonClicked(false);

      if (isLastStep) {
        if (!viewGuideHelper.isValidToSubmit()) {
          setCompleteButtonClicked(true);
          setShowCompleteAllQuestionsInTheGuide(true);
          return;
        }

        if (!session?.username && space.authSettings.enableLogin && space.guideSettings.askForLoginToSubmit) {
          setShowLoginModal(true);
          return;
        } else {
          const guideSubmitted = await viewGuideHelper.submitGuide();
          if (!guideSubmitted) {
            showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
            return;
          }
        }
      }
      viewGuideHelper.goToNextStep(step);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('plyr').then(({ default: Plyr }) => {
        const players = Array.from(document.querySelectorAll('.play-js-player'));
        const plyrInstances = players.map((p: any) => new Plyr(p));
        return () => {
          plyrInstances.forEach((player) => player.destroy());
        };
      });
    }
  }, [stepContents]);

  return (
    <div className="guide-stepper-content w-full sm:px-3 lg:px-4 flex flex-col justify-between">
      <div style={{ minHeight: '300px' }}>
        <h2 className="mb-8 pb-4 text-2xl">
          Step {step.stepOrder + 1} - {step.stepName}
        </h2>
        <div className="step-content markdown-body" dangerouslySetInnerHTML={{ __html: stepContents }} />
        {isGuideCompletedStep && <div className="step-content markdown-body pt-6" dangerouslySetInnerHTML={{ __html: postSubmissionContent || '' }} />}
        {guide.guideIntegrations?.projectGalaxyOatMintUrl && guideSubmission?.galaxyCredentialsUpdated && (
          <div className="mt-4 mb-6 bold">
            <h3 className="badge-heading">You have WON a Badge</h3>
            Claim your guide completion badge &nbsp;
            <a href={guide.guideIntegrations?.projectGalaxyOatMintUrl} className={`badge-claim-link ${styles.badgeClaimLink}`}>
              here
            </a>
          </div>
        )}
        {showIncorrectQuestions && (
          <div className="flex align-center justify-center mt-4">
            {!renderIncorrectQuestions && (
              <Button
                aria-label={$t('next')} // Make sure to import the `t` function from `react-i18next`
                className="w-[300px]"
                primary
                variant="contained"
                onClick={() => setRenderIncorrectQuestions(!renderIncorrectQuestions)}
                loading={viewGuideHelper.guideSubmitting}
                disabled={viewGuideHelper.guideSubmitting}
              >
                <span className="sm:block">{$t(renderIncorrectQuestions ? 'guide.hideQuestions' : 'guide.showIncorrectChoices')}</span>
              </Button>
            )}
            {isGuideCompletedStep && renderIncorrectQuestions && (
              <div className="mt-4 border-2 rounded-lg border-red p-4 w-full">
                <h3 className="mb-2">{$t('guide.correctAnswers')}</h3>
                {wrongQuestions.map((wrongQuestion) => (
                  <div key={wrongQuestion.uuid} className="mb-6">
                    <Question
                      answer-class="correct-answer"
                      question={wrongQuestion}
                      onSelectAnswer={() => {}}
                      questionResponse={wrongQuestion.answerKeys}
                      readonly={guideSubmission.isSubmitted}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {stepItems.map((item) => {
          if (isQuestion(item)) {
            return (
              <div className="mb-12" key={item.uuid}>
                <Question
                  key={item.uuid}
                  question={item as GuideQuestionFragment}
                  questionResponse={(viewGuideHelper.getStepItemSubmission(step.uuid, item.uuid) as []) || []}
                  onSelectAnswer={selectAnswer}
                />
              </div>
            );
          }

          if (isUserDiscordConnect(item)) {
            return (
              <UserDiscord
                key={item.uuid}
                userDiscord={item as GuideUserDiscordConnectFragment}
                discordResponse={viewGuideHelper.getStepItemSubmission(step.uuid, item.uuid) as UserDiscordInfoInput}
                spaceId={space.id}
                guideUuid={guide.id}
                stepUuid={step.uuid}
                stepOrder={viewGuideHelper.activeStepOrder}
              />
            );
          }
          if (isUserInput(item)) {
            const stepItem = item as GuideUserInputFragment;
            return (
              <UserInput
                key={item.uuid}
                modelValue={viewGuideHelper.getStepItemSubmission(step.uuid, item.uuid) as string}
                label={stepItem.label}
                required={stepItem.required}
                setUserInput={(value) => setUserInput(stepItem.uuid, value)}
              />
            );
          }
          return null;
        })}
      </div>
      {showCompleteAllQuestionsInTheGuide && <ErrorWithAccentBorder error={'Answer all the questions in guide to complete'} />}
      {showQuestionsCompletionWarning && (
        <>
          {!isEveryQuestionAnswered() && <ErrorWithAccentBorder error={'Answer all questions to proceed'} />}
          {!isDiscordConnected() && <ErrorWithAccentBorder error={'Connect Discord to proceed'} />}
        </>
      )}
      <div className="mt-2 py-2 pt-2">
        {isNotFirstStep && !isGuideCompletedStep && (
          <Button aria-label={$t('previous')} className="float-left w-[150px]" onClick={() => viewGuideHelper.goToPreviousStep(step)}>
            <span className="mr-2 font-bold">&#8592;</span>
            <span className="sm:block">{$t('guide.previous')}</span>
          </Button>
        )}
        {!isGuideCompletedStep && (
          <Button
            className="float-right w-[150px]"
            variant="contained"
            aria-label={$t('next')}
            primary
            loading={viewGuideHelper.guideSubmitting}
            disabled={viewGuideHelper.guideSubmitting || viewGuideHelper.guideSubmission.isSubmitted}
            onClick={navigateToNextStep}
          >
            <span className="sm:block">{$t(isLastStep ? 'guide.complete' : 'guide.next')}</span>
            <span className="ml-2 font-bold">&#8594;</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuideStep;
