import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import SwiperByteStepperItemContent from '@/components/bytes/View/SwiperByteView/SwiperByteStepperItemContent';
import { UseGenericViewByteHelper } from '@/components/bytes/View/useGenericViewByte';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
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
import { CSSProperties, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './SwiperlByteStepperItemView.module.scss';
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/virtual';

interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseGenericViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
}

const style: CSSProperties = {
  '--swiper-pagination-progressbar-bg-color': 'rgba(0,0,0,0.25)',
  '--swiper-pagination-progressbar-size': '6px',
  '--swiper-pagination-bullet-size': '12px',
  '--swiper-pagination-bullet-width': '12px',
  '--swiper-pagination-bullet-height': '12px',
  '--swiper-pagination-bullet-inactive-color': '#c1c1c1',
  '--swiper-pagination-bullet-inactive-opacity': '0.5',
  '--swiper-pagination-bullet-opacity': '1',
  '--swiper-pagination-bullet-horizontal-gap': '8px',
  '--swiper-pagination-bullet-vertical-gap': '12px',
} as any;

type TransitionState = 'enter' | 'active' | 'exit';

function SwiperByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted }: ByteStepperItemWithProgressBarProps) {
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

  const { width, height } = useWindowDimensions();

  const isShortScreen = height <= 690;
  return (
    <div className="w-full flex justify-center" style={style}>
      <div className={`${styles.swiperSlides}`}>
        <Swiper
          direction={'vertical'}
          modules={[Navigation, Pagination, Mousewheel, Keyboard]}
          navigation={true}
          onSlideChange={(swiper) => {
            const activeIndex = swiper.activeIndex;
            viewByteHelper.setActiveStep(activeIndex);
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            enabled: true,
          }}
          height={height - 100}
        >
          {byte.steps.map((step, index) => (
            <SwiperSlide key={step.uuid}>
              <SwiperByteStepperItemContent
                space={space}
                byte={byte}
                step={step}
                viewByteHelper={viewByteHelper}
                renderer={renderer}
                activeStepOrder={index}
                showCorrectAnswerForQuestion={showCorrectAnswerForQuestion}
                setByteSubmitted={setByteSubmitted}
                width={width}
                height={height}
                isShortScreen={isShortScreen}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <ByteStepperItemWarnings
          showQuestionsCompletionWarning={showQuestionsCompletionWarning}
          isUserInputComplete={isUserInputComplete}
          isQuestionAnswered={isQuestionAnswered}
          isDiscordConnected={isDiscordConnected}
        />
      </div>
    </div>
  );
}

export default SwiperByteStepperItemView;
