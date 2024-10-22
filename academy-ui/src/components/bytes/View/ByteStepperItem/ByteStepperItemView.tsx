import ByteStepperItemContent from '@/components/bytes/View/ByteStepperItemContent';
import StepIndicatorProgress from '@/components/bytes/View/ByteStepperItem/Progress/StepIndicatorProgress';
import { LAST_STEP_UUID, UseViewByteHelper } from '@/components/bytes/View/useViewByteHelper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { ByteDto, ByteStepDto, ImageDisplayMode } from '@/types/bytes/ByteDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
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
import { useRouter } from 'next/navigation';
import styles from './ByteStepperItemView.module.scss';

interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
  viewByteModalClosedUrl: string;
}

type TransitionState = 'enter' | 'active' | 'exit';

function ByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted, viewByteModalClosedUrl }: ByteStepperItemWithProgressBarProps) {
  const { activeStepOrder } = viewByteHelper;

  const router = useRouter();

  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;

  const isNotFirstStep = activeStepOrder !== 0;

  const isLastStep = byte.steps.length - 2 === activeStepOrder;

  const isByteCompletedStep = step.uuid === LAST_STEP_UUID;

  const [transitionState, setTransitionState] = useState<TransitionState>('enter');

  useEffect(() => {
    setTransitionState('enter');
    setTimeout(() => setTransitionState('active'), 100);
  }, [activeStepOrder]);

  const { setShowLoginModal } = useLoginModalContext();

  const sbmitByte = async () => {
    if (!session?.username && space.authSettings.enableLogin && space.byteSettings.askForLoginToSubmit) {
      setShowLoginModal(true);
      return;
    }
    await viewByteHelper.submitByte();
  };

  const navigateToNextStep = async () => {
    if (viewByteHelper.canNavigateToNext(step)) {
      if (isLastStep) {
        await sbmitByte();
      }

      setTimeout(async () => {
        viewByteHelper.goToNextStep(step);
      }, 300);

      setTransitionState('exit');
    }
  };

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
          activeStepOrder={activeStepOrder}
          setByteSubmitted={setByteSubmitted}
          width={width}
          height={height}
          isShortScreen={isShortScreen}
          isSwiper={false}
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
          {isByteCompletedStep && (
            <Button
              onClick={() => {
                router.push(viewByteModalClosedUrl);
              }}
              variant="contained"
              className="float-right w-[150px] mr-2 sm:mr-0"
              primary={true}
            >
              <span>Close</span>
              <span className="ml-2 font-bold">&#8594;</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ByteStepperItemView;
