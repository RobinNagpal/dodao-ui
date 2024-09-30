import ByteStepperItemContent from '@/components/bytes/View/ByteStepperItem/ByteStepperItemContent';
import StepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/StepIndicatorProgress';
import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import { LAST_STEP_UUID, UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { ByteDto, ByteStepDto, ByteViewMode, ImageDisplayMode } from '@/types/bytes/ByteDto';
import { ByteStepItem, Question } from '@/types/stepItems/stepItemDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isQuestion, isUserDiscordConnect } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import isEqual from 'lodash/isEqual';
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
import { useEffect, useState } from 'react';
import styles from './ByteStepperItemView.module.scss';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
}

type TransitionState = 'enter' | 'active' | 'exit';

function ByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted }: ByteStepperItemWithProgressBarProps) {
  const isSwiperMode = byte.viewMode !== ByteViewMode.Swiper;

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

      const answeredCorrectly = step.stepItems.filter(isQuestion).every((stepItem: ByteStepItem) => {
        const question = stepItem as Question;
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

  const showQuestionsCompletionWarning = nextButtonClicked && (!isQuestionAnswered() || !isDiscordConnected() || !isUserInputComplete());

  const { width, height } = useWindowDimensions();

  const isShortScreen = height <= 690;

  return (
    <div className={`w-full flex flex-col justify-between  ${!isShortScreen ? styles.longScreenStepContainer : styles.shortScreenStepContainer}`}>
      <div className={`flex flex-col flex-grow justify-center align-center ${isSwiperMode ? '' : transitionClasses[transitionState]} ${styles.stepContents}`}>
        {isSwiperMode ? (
          <Swiper
            onSlideChange={(swiper) => {
              const activeIndex = swiper.activeIndex;
              viewByteHelper.setActiveStep(activeIndex);
            }}
          >
            {byte.steps.map((step, index) => (
              <SwiperSlide key={step.uuid}>
                <ByteStepperItemContent
                  space={space}
                  byte={byte}
                  step={step}
                  viewByteHelper={viewByteHelper}
                  renderer={renderer}
                  activeStepOrder={index}
                  nextButtonClicked={nextButtonClicked}
                  questionsAnsweredCorrectly={questionsAnsweredCorrectly}
                  questionNotAnswered={questionNotAnswered}
                  setByteSubmitted={setByteSubmitted}
                  width={width}
                  height={height}
                  isShortScreen={isShortScreen}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <ByteStepperItemContent
            space={space}
            byte={byte}
            step={step}
            viewByteHelper={viewByteHelper}
            renderer={renderer}
            activeStepOrder={activeStepOrder}
            nextButtonClicked={nextButtonClicked}
            questionsAnsweredCorrectly={questionsAnsweredCorrectly}
            questionNotAnswered={questionNotAnswered}
            setByteSubmitted={setByteSubmitted}
            width={width}
            height={height}
            isShortScreen={isShortScreen}
          />
        )}
        <ByteStepperItemWarnings
          showUseInputCompletionWarning={incompleteUserInput}
          showQuestionsCompletionWarning={showQuestionsCompletionWarning}
          isUserInputComplete={isUserInputComplete}
          isQuestionAnswered={isQuestionAnswered}
          isDiscordConnected={isDiscordConnected}
        />
      </div>
      {!isShortScreen && step.displayMode !== ImageDisplayMode.FullScreenImage && (
        <StepIndicatorProgress
          steps={viewByteHelper.byteRef?.steps?.length || 2}
          currentStep={activeStepOrder}
          className="py-4 hidden md:block sm:hidden mb-4"
        />
      )}
      <div id="bottom-buttons" className={`absolute bottom-0 w-full z-10 ${styles.bottomActionBar}`}>
        <div className="py-4 px-4 w-full relative z-20">
          {isNotFirstStep && (
            <Button onClick={() => viewByteHelper.goToPreviousStep(step)} className="float-left pb-6 ml-2 sm:ml-0">
              <span className="mr-2 font-bold">&#8592;</span>
              Back
            </Button>
          )}
          {!isByteCompletedStep && (
            <Button
              onClick={navigateToNextStep}
              disabled={viewByteHelper.byteSubmitting}
              variant="contained"
              className="float-right w-[150px] mr-2 sm:mr-0"
              primary={true}
            >
              <span>{isLastStep ? 'Complete' : 'Next'}</span>
              <span className="ml-2 font-bold">&#8594;</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ByteStepperItemView;
