import UserDiscord from '@/components/app/Form/UserDiscord';
import UserInput from '@dodao/web-core/components/app/Form/UserInput';
import StepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/StepIndicatorProgress';
import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import { QuestionSection } from '@/components/bytes/View/QuestionSection';
import { LAST_STEP_UUID, UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  ByteDetailsFragment,
  ByteQuestionFragmentFragment,
  ByteStepFragment,
  ByteStepItemFragment,
  ByteUserDiscordConnectFragmentFragment,
  ByteUserInputFragmentFragment,
  SpaceWithIntegrationsFragment,
  UserDiscordInfoInput,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isQuestion, isUserDiscordConnect, isUserInput } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
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
import ImageSkeleton from '../../Skeletons/ImageSkeleton';
import QuestionSkeleton from '../../Skeletons/QuestionSkeleton';
import HeadingSkeleton from '../../Skeletons/HeadingSkeleton';
import TextSkeleton from '../../Skeletons/TextSkeleton';

interface WithCarouselAndProgress1Props {
  byte: ByteDetailsFragment;
  step: ByteStepFragment;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
}

type TransitionState = 'enter' | 'active' | 'exit';

function ByteStepperItemWithProgressBar({ viewByteHelper, step, byte, space, setByteSubmitted }: WithCarouselAndProgress1Props) {
  const { activeStepOrder } = viewByteHelper;
  const { $t: t } = useI18();
  const { showNotification } = useNotificationContext();

  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const renderer = getMarkedRenderer();

  const isNotFirstStep = activeStepOrder !== 0;

  const isLastStep = byte.steps.length - 2 === activeStepOrder;

  const isByteCompletedStep = step.uuid === LAST_STEP_UUID;

  const [nextButtonClicked, setNextButtonClicked] = useState(false);
  const [incompleteUserInput, setIncompleteUserInput] = useState(false);
  const [questionNotAnswered, setQuestionNotAnswered] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>('enter');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true); // Show skeletons when the step changes
    const timeoutId = setTimeout(() => {
      setLoading(false); // Hide skeletons after a delay
    }, 1000); // Adjust the delay as needed

    setTransitionState('enter');
    setTimeout(() => setTransitionState('active'), 100);
    return () => clearTimeout(timeoutId);
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
        showNotification({
          type: 'info',
          message: t('Your answer is wrong! Give correct answer to proceed.'),
          heading: 'Hint',
        });
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
        setByteSubmitted(true);
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

  const isShortScreen = height <= 690;
  const isLongScreen = height >= 900;

  const stepClasses = {
    headingClasses: isShortScreen ? 'text-3xl' : isLongScreen ? 'text-4xl xl:text-5xl' : 'text-3xl',
    contentClasses: isShortScreen ? 'text-lg' : isLongScreen ? 'text-lg xl:text-2xl' : 'text-lg',
  };

  return (
    <div className={`w-full flex flex-col justify-between py-12 px-4 md:px-8  ${styles.stepContainer}`}>
      <div className={`w-full overflow-y-auto flex flex-col ${transitionClasses[transitionState]} ${styles.stepContents} ${styles.hideScrollbar}`}>
        <div className="flex flex-col flex-grow justify-center align-center">
          {!stepItems.some(isQuestion) && !isShortScreen && step.imageUrl && (
            <div className="flex justify-center align-center ">
              {!loading ? <img src={step.imageUrl} alt="byte" className={`max-h-[35vh] rounded ${styles.imgContainer}`} /> : <ImageSkeleton />}
            </div>
          )}
          {loading ? (
            <HeadingSkeleton />
          ) : (
            <div className="flex justify-center w-full mt-4">
              <h1 className={stepClasses.headingClasses}>{step.name || byte.name}</h1>
            </div>
          )}
          <div className="mt-4 lg:mt-8 text-left">
            {loading ? (
              <TextSkeleton />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: stepContents }} className={`markdown-body text-center ` + stepClasses.contentClasses} />
            )}
            {stepItems.map((stepItem: ByteStepItemFragment, index) => {
              if (isQuestion(stepItem)) {
                return (
                  <div key={index} className="border-2 rounded-lg p-4 border-transparent ">
                    {loading ? (
                      <QuestionSkeleton />
                    ) : (
                      <QuestionSection
                        key={index}
                        nextButtonClicked={nextButtonClicked}
                        allQuestionsAnsweredCorrectly={questionsAnsweredCorrectly}
                        allQuestionsAnswered={questionNotAnswered}
                        stepItem={stepItem as ByteQuestionFragmentFragment}
                        stepItemSubmission={viewByteHelper.getStepItemSubmission(step.uuid, stepItem.uuid)}
                        onSelectAnswer={selectAnswer}
                      />
                    )}
                  </div>
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
      </div>
      <div className="absolute bottom-6 w-full -mx-4 px-4 sm:-mx-8 ">
        {!isShortScreen && (
          <StepIndicatorProgress steps={viewByteHelper.byteRef?.steps?.length || 2} currentStep={activeStepOrder} className="py-4 hidden md:block sm:hidden" />
        )}
        <div className="w-full">
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
