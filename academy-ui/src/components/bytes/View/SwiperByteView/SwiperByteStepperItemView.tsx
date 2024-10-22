import ByteStepperItemContent from '@/components/bytes/View/ByteStepperItemContent';
import { UseViewByteHelper } from '@/components/bytes/View/useViewByteHelper';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { ByteDto, ByteStepDto, ImageDisplayMode } from '@/types/bytes/ByteDto';
import { CSSProperties, useRef, useState } from 'react';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { Keyboard, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/virtual';
import { Swiper, SwiperSlide } from 'swiper/react';
import { NavigationOptions } from 'swiper/types';
import styles from './SwiperlByteStepperItemView.module.scss';

interface ByteStepperItemWithProgressBarProps {
  byte: ByteDto;
  step: ByteStepDto;
  space: SpaceWithIntegrationsFragment;
  viewByteHelper: UseViewByteHelper;
  setByteSubmitted: (submitted: boolean) => void;
  onClose: () => void;
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
<div class="flex custom-swiper-bullet">
  <span class="mr-2 mt-3 swiper-pagination-custom-text ${isCompleted ? 'completed' : ''}">${byte.steps?.[index].name}</span>
  <span class=" ${className} ${index === activeStepOrder ? 'swiper-pagination-bullet-active' : ''} cursor-default ${isCompleted ? 'completed' : ''}">${
    index + 1
  }</span>
</div>`;
};

function SwiperByteStepperItemView({ viewByteHelper, step, byte, space, setByteSubmitted, onClose }: ByteStepperItemWithProgressBarProps) {
  const [isLastStep, setisLastStep] = useState(false);

  const { activeStepOrder } = viewByteHelper;

  // See - https://stackoverflow.com/a/69238830/440432
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const { width, height } = useWindowDimensions();

  const isShortScreen = height <= 690;
  const showClickForNextStep = step.stepItems?.length > 0 && viewByteHelper.isStepTouched(step.uuid);
  const showScrollDown = activeStepOrder == 0 && !viewByteHelper.isStepTouched(step.uuid);
  console.log('showScrollDown', showScrollDown, 'activeStepOrder', activeStepOrder, 'isStepTouched', viewByteHelper.isStepTouched(step.uuid));
  return (
    <div className="w-full flex justify-center mr-20" style={style}>
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
            if (swiper.isEnd) {
              setTimeout(() => {
                setisLastStep(true);
              }, 200); // Delay is added to prevent the close button to appear before the complete view of the last step appears
            } else {
              setisLastStep(false);
            }
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
          onBeforeTransitionStart={async (swiper) => {
            if (!viewByteHelper.canNavigateToNext(step)) {
              console.log('Cannot navigate to next');
              swiper.slideTo(activeStepOrder, 300, false);
            } else {
              if (activeStepOrder === byte.steps.length - 2) {
                await viewByteHelper.submitByte();
              }
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
              {isLastStep && (
                <Button onClick={onClose} variant="contained" className="absolute bottom-8 w-[150px] mr-2 sm:mr-0" primary={true}>
                  <span>Close</span>
                  <span className="ml-2 font-bold">&#8594;</span>
                </Button>
              )}
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
              display: showScrollDown || showClickForNextStep ? 'block' : 'none', // We are hiding the next button we just want to show it on the first slide
            }}
          >
            {showClickForNextStep ? (
              <div className={`w-36 ${styles.clickHereForNextButtonText}`}>Click Here for Next</div>
            ) : (
              <div className={`w-24 ${styles.scrollDownNextButtonText}`}>Scroll Down</div>
            )}
          </div>
        </Swiper>
      </div>
    </div>
  );
}

export default SwiperByteStepperItemView;
