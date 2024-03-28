import UserDiscord from '@/components/app/Form/UserDiscord';
import UserInput from '@/components/app/Form/UserInput';
import StepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/StepIndicatorProgress';
import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import { QuestionSection } from '@/components/bytes/View/QuestionSection';
import { LAST_STEP_UUID, UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import Button from '@/components/core/buttons/Button';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ByteDetailsFragment,
  ByteQuestionFragmentFragment,
  ByteStepFragment,
  ByteStepItemFragment,
  ByteUserDiscordConnectFragmentFragment,
  ByteUserInputFragmentFragment,
  ProjectByteFragment,
  SpaceWithIntegrationsFragment,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@/types/deprecated/helpers/stepItemTypes';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import isEqual from 'lodash/isEqual';
import { marked } from 'marked';
import { useSession } from 'next-auth/react';
import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-yaml';
import { useEffect, useMemo, useState } from 'react';
import styles from './ByteStepperItemWithProgressBar.module.scss';

interface WithCarouselAndProgress1Props {
  byte: ByteDetailsFragment | ProjectByteFragment;
  step: ByteStepFragment;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
}

type TransitionState = 'enter' | 'active' | 'exit';

function ByteStepperItemWithProgressBar({ viewByteHelper, step, byte, space }: WithCarouselAndProgress1Props) {
  const { activeStepOrder } = viewByteHelper;
  const { $t: t } = useI18();
  const { showNotification } = useNotificationContext();

  const { data: session } = useSession();
  const renderer = getMarkedRenderer();

  const isNotFirstStep = activeStepOrder !== 0;

  const isLastStep = byte.steps.length - 2 === activeStepOrder;

  const isByteCompletedStep = step.uuid === LAST_STEP_UUID;

  const [nextButtonClicked, setNextButtonClicked] = useState(false);
  const [incompleteUserInput, setIncompleteUserInput] = useState(false);
  const [questionNotAnswered, setQuestionNotAnswered] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>('enter');

  useEffect(() => {
    setTransitionState('enter');
    setTimeout(() => setTransitionState('active'), 100);
  }, [activeStepOrder]);

  const [questionsAnsweredCorrectly, setQuestionsAnsweredCorrectly] = useState(false);

  const { setShowLoginModal } = useLoginModalContext();
  function isQuestionAnswered() {
    return viewByteHelper.isQuestionAnswered(step.uuid);
  }

  function isUserInputComplete() {
    return viewByteHelper.isUserInputComplete(step.uuid);
  }

  function isDiscordConnected(): boolean {
    const hasDiscordConnect = step.stepItems.find(isUserDiscordConnect);
    if (!hasDiscordConnect) return true;
    return !!viewByteHelper.getStepItemSubmission(step.uuid, hasDiscordConnect.uuid);
  }

  const navigateToNextStep = async () => {
    setNextButtonClicked(true);
    setIncompleteUserInput(false);

    if (isQuestionAnswered() && isDiscordConnected() && isUserInputComplete()) {
      setQuestionNotAnswered(true);

      const answeredCorrectly = step.stepItems.filter(isQuestion).every((stepItem: ByteStepItemFragment) => {
        const question = stepItem as ByteQuestionFragmentFragment;
        return isEqual(question.answerKeys.sort(), ((viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid) as string[]) || []).sort());
      });

      if (!answeredCorrectly) {
        setQuestionsAnsweredCorrectly(false);
        return;
      } else {
        setQuestionsAnsweredCorrectly(true);
      }
      setNextButtonClicked(false);

      if (isLastStep) {
        if (!viewByteHelper.isValidToSubmit()) {
          setIncompleteUserInput(true);
          return;
        }

        if (!session?.username && space.authSettings.enableLogin && space.byteSettings.askForLoginToSubmit) {
          setShowLoginModal(true);
          return;
        } else {
          const byteSubmitted = await viewByteHelper.submitByte();
          if (!byteSubmitted) {
            showNotification({
              type: 'error',
              message: t('notify.somethingWentWrong'),
              heading: 'Error',
            });
            return;
          }
        }
      }

      setTransitionState('exit');
      setTimeout(async () => {
        viewByteHelper.goToNextStep(step);
      }, 300);
    }
  };

  const transitionClasses: Record<TransitionState, string> = {
    enter: 'opacity-0 ease-in-out',
    active: 'transition-opacity transition-transform duration-300 ease-in-out opacity-100',
    exit: 'transition-opacity transition-transform duration-300 ease-in-out opacity-0',
  };

  const stepItems = step.stepItems;

  const stepContents = useMemo(() => marked.parse(step.content, { renderer }), [step.content]);

  const postSubmissionContent = useMemo(
    () => (byte.postSubmissionStepContent ? marked.parse(byte.postSubmissionStepContent, { renderer }) : null),
    [byte.postSubmissionStepContent]
  );

  const selectAnswer = (questionId: string, selectedAnswers: string[]) => {
    viewByteHelper.selectAnswer(step.uuid, questionId, selectedAnswers);
  };

  const setUserInput = (userInputUuid: string, userInput: string) => {
    viewByteHelper.setUserInput(step.uuid, userInputUuid, userInput);
  };

  const showQuestionsCompletionWarning = nextButtonClicked && (!isQuestionAnswered() || !isDiscordConnected() || !isUserInputComplete());

  const { height } = useWindowDimensions();

  const showProgressBar = height > 768;

  return (
    <div className={`h-full w-full flex flex-col justify-between py-12 lg:px-8 sm:px-2 ${styles.stepContainer}`}>
      <div className={`h-full w-full flex flex-col items-center justify-center ${transitionClasses[transitionState]}  ${styles.stepContent}`}>
        {!stepItems.some(isQuestion) && step.imageUrl && (
          <div
            style={{
              width: '450px',
              height: '450px',
              maxWidth: '35vh',
              maxHeight: '35vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={step.imageUrl}
              alt="byte"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
              }}
            />
          </div>
        )}
        <div className="flex justify-center w-full mt-4">
          <h1 className={`text-4xl xl:text-5xl`}>{step.name || byte.name}</h1>
        </div>

        <div className="mt-4 lg:mt-8 text-left">
          <div dangerouslySetInnerHTML={{ __html: stepContents }} className={`markdown-body text-lg xl:text-2xl px-2 sm:px-0`} />
          {stepItems.map((stepItem: ByteStepItemFragment, index) => {
            if (isQuestion(stepItem)) {
              return (
                <QuestionSection
                  key={index}
                  nextButtonClicked={nextButtonClicked}
                  allQuestionsAnsweredCorrectly={questionsAnsweredCorrectly}
                  allQuestionsAnswered={questionNotAnswered}
                  stepItem={stepItem as ByteQuestionFragmentFragment}
                  stepItemSubmission={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid)}
                  onSelectAnswer={selectAnswer}
                />
              );
            }

            if (isUserDiscordConnect(stepItem)) {
              return (
                <UserDiscord
                  key={index}
                  userDiscord={stepItem as ByteUserDiscordConnectFragmentFragment}
                  discordResponse={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid) as UserDiscordInfoInput}
                  spaceId={space.id}
                  guideUuid={byte.id}
                  stepUuid={step.uuid}
                  stepOrder={activeStepOrder}
                />
              );
            }

            if (isUserInput(stepItem)) {
              const inputFragment = stepItem as ByteUserInputFragmentFragment;
              return (
                <UserInput
                  key={index}
                  modelValue={viewByteHelper.getStepItemSubmission(step.uuid, inputFragment.uuid) as string}
                  label={inputFragment.label}
                  required={inputFragment.required}
                  setUserInput={(userInput: string) => setUserInput(inputFragment.uuid, userInput)}
                />
              );
            }

            return null;
          })}
          {postSubmissionContent && <div className="mt-4 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: postSubmissionContent }} />}
        </div>

        <ByteStepperItemWarnings
          showUseInputCompletionWarning={incompleteUserInput}
          showQuestionsCompletionWarning={showQuestionsCompletionWarning}
          isUserInputComplete={isUserInputComplete}
          isQuestionAnswered={isQuestionAnswered}
          isDiscordConnected={isDiscordConnected}
        />
      </div>
      <div>
        {showProgressBar && (
          <StepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 2} currentStep={activeStepOrder} className="py-4 hidden sm:block" />
        )}
        <div>
          {isNotFirstStep && !isByteCompletedStep && (
            <Button onClick={() => viewByteHelper.goToPreviousStep(step)} className="float-left ml-2 sm:ml-0">
              <span className="mr-2 font-bold">&#8592;</span>
              Back
            </Button>
          )}
          {!isByteCompletedStep && (
            <Button
              onClick={navigateToNextStep}
              disabled={viewByteHelper.byteSubmitting || viewByteHelper.byteSubmission.isSubmitted}
              variant="contained"
              className="float-right w-[150px] mr-2 sm:mr-0"
              primary={true}
            >
              <span className="sm:block">{isLastStep ? 'Complete' : 'Next'}</span>
              <span className="ml-2 font-bold">&#8594;</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ByteStepperItemWithProgressBar;
