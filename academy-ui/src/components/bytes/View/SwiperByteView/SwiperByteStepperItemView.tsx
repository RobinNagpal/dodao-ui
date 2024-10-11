import ByteStepperItemContent from '@/components/bytes/View/ByteStepperItemContent';
import { UseViewByteHelper } from '@/components/bytes/View/useViewByteInModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { ByteDto, ByteStepDto, ImageDisplayMode } from '@/types/bytes/ByteDto';
import { CSSProperties, useRef } from 'react';

import { Keyboard, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/virtual';
import { Swiper, SwiperSlide } from 'swiper/react';
import { NavigationOptions, type Swiper as SwiperClass } from 'swiper/types';
import styles from './SwiperlByteStepperItemView.module.scss';

interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
}

const style: CSSProperties = {
  '--swiper-pagination-progressbar-bg-color': 'rgba(0,0,0,0.25)',
  '--swiper-pagination-progressbar-size': '6px',
  '--swiper-pagination-bullet-size': '24px',
  '--swiper-pagination-bullet-border-radius': '12px',
  '--swiper-pagination-bullet-width': '24px',
  '--swiper-pagination-bullet-height': '24px',
  '--swiper-pagination-bullet-inactive-color': '#c1c1c1',
  '--swiper-pagination-bullet-inactive-opacity': '0.5',
  '--swiper-pagination-bullet-opacity': '1',
  '--swiper-pagination-bullet-horizontal-gap': '8px',
  '--swiper-pagination-bullet-vertical-gap': '12px',
  '--swiper-pagination-color': 'var(--primary-color)',
} as any;

const renderBullet = (index: number, className: string, byte: ByteDto, activeStepOrder: number) => {
  const isCompleted = index < activeStepOrder;
  console.log('isCompleted', isCompleted, index, activeStepOrder);
  return `
<div class="flex custom-swiper-bullet ${isCompleted ? 'completed' : ''}">
  <span class="mr-2 mt-3 swiper-pagination-custom-text">${byte.steps?.[index].name}</span>
  <span class=" ${className} ${index === activeStepOrder ? 'swiper-pagination-bullet-active' : ''} cursor-default">${index + 1}</span>
</div>`;
};

function SwiperByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted }: ByteStepperItemWithProgressBarProps) {
  const { activeStepOrder } = viewByteHelper;

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
          onSlideChangeTransitionEnd={(swiper) => {
            swiper.pagination.render();
          }}
          mousewheel={{
            forceToAxis: true,
          }}
          pagination={{
            clickable: false,
            enabled: true,
            renderBullet: (index, className) => renderBullet(index, className, byte, activeStepOrder),
          }}
          allowTouchMove={true}
          simulateTouch={true}
          autoFocus={true}
          onBeforeTransitionStart={(swiper) => {
            if (!viewByteHelper.canNavigateToNext(step)) {
              console.log('Cannot navigate to next');
              swiper.slideTo(activeStepOrder, 300, false);
            }
          }}
          className={styles.swiperSlides}
          id="byte-view-swiper"
        >
          {byte.steps.map((step, index) => (
            <SwiperSlide
              key={step.uuid}
              className={`${styles.swiperSlide}  ${step?.displayMode === ImageDisplayMode.FullScreenImage ? 'full-screen-image' : ''}`}
            >
              <ByteStepperItemContent
                space={space}
                byte={byte}
                step={step}
                viewByteHelper={viewByteHelper}
                activeStepOrder={index}
                setByteSubmitted={setByteSubmitted}
                width={width}
                height={height}
                isShortScreen={isShortScreen}
                isSwiper={true}
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
            className={`swiper-button-next ${styles.customNextButton}`}
            style={{
              display: activeStepOrder > 0 ? 'none' : 'block', // We are hiding the next button we just want to show it on the first slide
            }}
          >
            <div className={`w-24 ${styles.nextButtonText}`}>Scroll Down</div>
          </div>
        </Swiper>
      </div>
    </div>
  );
}

export default SwiperByteStepperItemView;
