import ByteStepperItemContent from '@/components/bytes/View/ByteStepperItem/ByteStepperItemContent';
import StepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/StepIndicatorProgress';
import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import { ByteViewBottomButtonBar } from '@/components/bytes/View/ByteViewBottomButtonBar';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { ByteDto, ByteStepDto, ImageDisplayMode } from '@/types/bytes/ByteDto';
import { isUserDiscordConnect } from '@dodao/web-core/types/deprecated/helpers/stepItemTypes';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
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

interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
}

type TransitionState = 'enter' | 'active' | 'exit';

function ByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted }: ByteStepperItemWithProgressBarProps) {
  const { activeStepOrder } = viewByteHelper;
  const renderer = getMarkedRenderer();

  const [transitionState, setTransitionState] = useState<TransitionState>('enter');

  const [showCorrectAnswerForQuestion, setShowCorrectAnswerForQuestion] = useState(false);
  const [showQuestionsCompletionWarning, setShowQuestionsCompletionWarning] = useState(false);
  useEffect(() => {
    setTransitionState('enter');
    setTimeout(() => setTransitionState('active'), 100);
  }, [activeStepOrder]);

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

  const transitionClasses: Record<TransitionState, string> = {
    enter: 'opacity-0 ease-in-out',
    active: 'transition-opacity transition-transform duration-300 ease-in-out opacity-100',
    exit: 'transition-opacity transition-transform duration-300 ease-in-out opacity-0',
  };

  const { width, height } = useWindowDimensions();

  const isShortScreen = height <= 690;

  return (
    <div className={`w-full flex flex-col justify-between  ${!isShortScreen ? styles.longScreenStepContainer : styles.shortScreenStepContainer}`}>
      <div className={`flex flex-col flex-grow justify-center align-center ${transitionClasses[transitionState]} ${styles.stepContents}`}>
        <ByteStepperItemContent
          space={space}
          byte={byte}
          step={step}
          viewByteHelper={viewByteHelper}
          renderer={renderer}
          activeStepOrder={activeStepOrder}
          showCorrectAnswerForQuestion={showCorrectAnswerForQuestion}
          setByteSubmitted={setByteSubmitted}
          width={width}
          height={height}
          isShortScreen={isShortScreen}
        />
        <ByteStepperItemWarnings
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
      <ByteViewBottomButtonBar
        viewByteHelper={viewByteHelper}
        step={step}
        byte={byte}
        setByteSubmitted={setByteSubmitted}
        space={space}
        isUserInputComplete={isUserInputComplete}
        isQuestionAnswered={isQuestionAnswered}
        isDiscordConnected={isDiscordConnected}
        setShowCorrectAnswerForQuestion={setShowCorrectAnswerForQuestion}
        setShowQuestionsCompletionWarning={setShowQuestionsCompletionWarning}
      />
    </div>
  );
}

export default ByteStepperItemView;
