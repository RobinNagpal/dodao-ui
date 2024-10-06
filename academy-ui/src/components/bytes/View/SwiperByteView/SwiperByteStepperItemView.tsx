import ByteStepperItemWarnings from '@/components/bytes/View/ByteStepperItemWarnings';
import SwiperByteStepperItemContent from '@/components/bytes/View/SwiperByteView/SwiperByteStepperItemContent';
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
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/virtual';
import { NavigationOptions } from 'swiper/types';
import styles from './SwiperlByteStepperItemView.module.scss';

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
  '--swiper-pagination-color': 'var(--primary-color)',
} as any;

function SwiperByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted }: ByteStepperItemWithProgressBarProps) {
  const { activeStepOrder } = viewByteHelper;
  const renderer = getMarkedRenderer();

  const [showCorrectAnswerForQuestion, setShowCorrectAnswerForQuestion] = useState(false);
  const [showQuestionsCompletionWarning, setShowQuestionsCompletionWarning] = useState(false);

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

  // See - https://stackoverflow.com/a/69238830/440432
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const { width, height } = useWindowDimensions();

  const isShortScreen = height <= 690;
  return (
    <div className="w-full flex justify-center" style={style}>
      <div className={`${styles.swiperSlides}`}>
        <Swiper
          direction={'vertical'}
          slidesPerView={1}
          spaceBetween={50}
          modules={[Navigation, Pagination, Mousewheel, Keyboard]}
          navigation={{
            enabled: true,
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          onBeforeInit={(swiper) => {
            const navigation = swiper.params.navigation;
            if (!navigation) return;

            // See - https://stackoverflow.com/a/69238830/440432
            const nav = navigation as NavigationOptions;
            nav.prevEl = navigationPrevRef.current;
            nav.nextEl = navigationNextRef.current;
          }}
          onSlideChange={(swiper) => {
            const activeIndex = swiper.activeIndex;
            viewByteHelper.setActiveStep(activeIndex);
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          pagination={{
            clickable: true,
            enabled: true,
          }}
          className={styles.swiperSlides}
          id="byte-view-swiper"
        >
          {byte.steps.map((step, index) => (
            <SwiperSlide
              key={step.uuid}
              className={`${styles.swiperSlide}  ${step?.displayMode === ImageDisplayMode.FullScreenImage ? 'full-screen-image' : ''}`}
            >
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
          <div
            ref={navigationPrevRef}
            className={`swiper-button-prev`}
            style={{
              display: 'none', // We are hiding the prev button as it looks a bit off at the top
            }}
          />
          <div
            ref={navigationNextRef}
            className={`swiper-button-next`}
            style={{
              display: activeStepOrder > 0 ? 'none' : 'block', // We are hiding the next button we just want to show it on the first slide
            }}
          />
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
