'use client';

import { Fragment, LegacyRef, useEffect, useId, useRef, useState } from 'react';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { AnimatePresence, type MotionProps, type Variant, type Variants, motion } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

import { AppScreen } from './AppScreen';
import { CircleBackground } from './CircleBackground';
import { Container } from './Container';
import { PhoneFrame } from './PhoneFrame';
import Image from 'next/image';
import Tidbits from '@/images/lifeInsure/images/tidbits.png';
import Quizzes from '@/images/lifeInsure/images/quiz.png';
import Shorts from '@/images/lifeInsure/images/shorts.png';
import Demos from '@/images/lifeInsure/images/demos.png';

const MotionAppScreenHeader = motion(AppScreen.Header);
const MotionAppScreenBody = motion(AppScreen.Body);

interface CustomAnimationProps {
  isForwards: boolean;
  changeCount: number;
}

const features = [
  {
    name: 'Concise, Step-by-Step Tidbits',
    description:
      'Learn quickly with short, clear steps. Each tidbit breaks down complex information into simple sentences, making learning fast and efficient.',
    icon: DeviceUserIcon,
    screen: InviteScreen,
  },
  {
    name: 'Interactive Clickable Demos',
    description:
      'Experience features firsthand with our guided, interactive demos. Users learn by clicking through simulations, understanding functionality in just seconds.',
    icon: DeviceTouchIcon,
    screen: DemosScreen,
  },
  {
    name: 'One-Minute Videos',
    description:
      'Dive into different concepts with our one-minute videos. Each piece distills complex information into easy-to-understand visuals, perfect for quick learning.',
    icon: DeviceNotificationIcon,
    screen: StocksScreen,
  },
  {
    name: 'Interactive Quizzes',
    description:
      'Reinforce learning of your users with fun quizzes after each topic. Get instant feedback to solidify your knowledge and encourage deeper exploration.',
    icon: DeviceTouchIcon,
    screen: InvestScreen,
  },
];

function DeviceUserIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <circle cx={16} cy={16} r={16} fill="#A3A3A3" fillOpacity={0.2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 23a3 3 0 100-6 3 3 0 000 6zm-1 2a4 4 0 00-4 4v1a2 2 0 002 2h6a2 2 0 002-2v-1a4 4 0 00-4-4h-2z"
        fill="#737373"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4a4 4 0 014-4h14a4 4 0 014 4v24a4.002 4.002 0 01-3.01 3.877c-.535.136-.99-.325-.99-.877s.474-.98.959-1.244A2 2 0 0025 28V4a2 2 0 00-2-2h-1.382a1 1 0 00-.894.553l-.448.894a1 1 0 01-.894.553h-6.764a1 1 0 01-.894-.553l-.448-.894A1 1 0 0010.382 2H9a2 2 0 00-2 2v24a2 2 0 001.041 1.756C8.525 30.02 9 30.448 9 31s-.455 1.013-.99.877A4.002 4.002 0 015 28V4z"
        fill="#A3A3A3"
      />
    </svg>
  );
}

function DeviceNotificationIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <circle cx={16} cy={16} r={16} fill="#A3A3A3" fillOpacity={0.2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0a4 4 0 00-4 4v24a4 4 0 004 4h14a4 4 0 004-4V4a4 4 0 00-4-4H9zm0 2a2 2 0 00-2 2v24a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2h-1.382a1 1 0 00-.894.553l-.448.894a1 1 0 01-.894.553h-6.764a1 1 0 01-.894-.553l-.448-.894A1 1 0 0010.382 2H9z"
        fill="#A3A3A3"
      />
      <path d="M9 8a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H11a2 2 0 01-2-2V8z" fill="#737373" />
    </svg>
  );
}

function DeviceTouchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  let id = useId();

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={`${id}-gradient`} x1={14} y1={14.5} x2={7} y2={17} gradientUnits="userSpaceOnUse">
          <stop stopColor="#737373" />
          <stop offset={1} stopColor="#D4D4D4" stopOpacity={0} />
        </linearGradient>
      </defs>
      <circle cx={16} cy={16} r={16} fill="#A3A3A3" fillOpacity={0.2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4a4 4 0 014-4h14a4 4 0 014 4v13h-2V4a2 2 0 00-2-2h-1.382a1 1 0 00-.894.553l-.448.894a1 1 0 01-.894.553h-6.764a1 1 0 01-.894-.553l-.448-.894A1 1 0 0010.382 2H9a2 2 0 00-2 2v24a2 2 0 002 2h4v2H9a4 4 0 01-4-4V4z"
        fill="#A3A3A3"
      />
      <path d="M7 22c0-4.694 3.5-8 8-8" stroke={`url(#${id}-gradient)`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M21 20l.217-5.513a1.431 1.431 0 00-2.85-.226L17.5 21.5l-1.51-1.51a2.107 2.107 0 00-2.98 0 .024.024 0 00-.005.024l3.083 9.25A4 4 0 0019.883 32H25a4 4 0 004-4v-5a3 3 0 00-3-3h-5z"
        fill="#A3A3A3"
      />
    </svg>
  );
}

const headerAnimation: Variants = {
  initial: { opacity: 0, transition: { duration: 0.3 } },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const maxZIndex = 2147483647;

const bodyVariantBackwards: Variant = {
  opacity: 0.4,
  scale: 0.8,
  zIndex: 0,
  filter: 'blur(4px)',
  transition: { duration: 0.4 },
};

const bodyVariantForwards: Variant = (custom: CustomAnimationProps) => ({
  y: '100%',
  zIndex: maxZIndex - custom.changeCount,
  transition: { duration: 0.4 },
});

const bodyAnimation: MotionProps = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: {
    initial: (custom: CustomAnimationProps, ...props) => (custom.isForwards ? bodyVariantForwards(custom, ...props) : bodyVariantBackwards),
    animate: (custom: CustomAnimationProps) => ({
      y: '0%',
      opacity: 1,
      scale: 1,
      zIndex: maxZIndex / 2 - custom.changeCount,
      filter: 'blur(0px)',
      transition: { duration: 0.4 },
    }),
    exit: (custom: CustomAnimationProps, ...props) => (custom.isForwards ? bodyVariantBackwards : bodyVariantForwards(custom, ...props)),
  },
};

type ScreenProps =
  | {
      animated: true;
      custom: CustomAnimationProps;
    }
  | { animated?: false };

function InviteScreen(props: ScreenProps) {
  return (
    <AppScreen className="w-full">
      <MotionAppScreenHeader {...(props.animated ? headerAnimation : {})}>
        <AppScreen.Title>Step-by-Step Tidbits</AppScreen.Title>
        <AppScreen.Subtitle>Each tidbit crafted for better learning</AppScreen.Subtitle>
      </MotionAppScreenHeader>

      <MotionAppScreenBody {...(props.animated ? { ...bodyAnimation, custom: props.custom } : {})}>
        <Image src={Tidbits} alt="Tidbits" />
      </MotionAppScreenBody>
    </AppScreen>
  );
}

function DemosScreen(props: ScreenProps) {
  return (
    <AppScreen className="w-full">
      <MotionAppScreenHeader {...(props.animated ? headerAnimation : {})}>
        <AppScreen.Title>Clickable Demos</AppScreen.Title>
        <AppScreen.Subtitle>Users learn by doing</AppScreen.Subtitle>
      </MotionAppScreenHeader>

      <MotionAppScreenBody {...(props.animated ? { ...bodyAnimation, custom: props.custom } : {})}>
        <Image src={Demos} alt="Clickable Demos" />
      </MotionAppScreenBody>
    </AppScreen>
  );
}

function StocksScreen(props: ScreenProps) {
  return (
    <AppScreen className="w-full">
      <MotionAppScreenHeader {...(props.animated ? headerAnimation : {})}>
        <AppScreen.Title>Short Videos</AppScreen.Title>
        <AppScreen.Subtitle>1 minute videos to summarize the concepts</AppScreen.Subtitle>
      </MotionAppScreenHeader>
      <MotionAppScreenBody {...(props.animated ? { ...bodyAnimation, custom: props.custom } : {})}>
        <Image src={Shorts} alt="Shorts" />
      </MotionAppScreenBody>
    </AppScreen>
  );
}

function InvestScreen(props: ScreenProps) {
  return (
    <AppScreen className="w-full">
      <MotionAppScreenHeader {...(props.animated ? headerAnimation : {})}>
        <AppScreen.Title>Interactive Quizzes</AppScreen.Title>
        <AppScreen.Subtitle>Each tidbit is followed by a quick quiz</AppScreen.Subtitle>
      </MotionAppScreenHeader>
      <MotionAppScreenBody {...(props.animated ? { ...bodyAnimation, custom: props.custom } : {})}>
        <Image src={Quizzes} alt="Quizzes" />
      </MotionAppScreenBody>
    </AppScreen>
  );
}

function usePrevious<T>(value: T) {
  let ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function FeaturesDesktop() {
  let [changeCount, setChangeCount] = useState(0);
  let [selectedIndex, setSelectedIndex] = useState(0);
  let timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoSwitch = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % features.length);
      setChangeCount((prevCount) => prevCount + 1);
      startAutoSwitch();
    }, 3000);
  };

  useEffect(() => {
    startAutoSwitch();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleManualChange = (newIndex: number) => {
    setSelectedIndex(newIndex);
    setChangeCount((changeCount) => changeCount + 1);
    startAutoSwitch();
  };

  return (
    <Tab.Group
      as="div"
      className="grid grid-cols-12 items-center gap-8 lg:gap-16 xl:gap-24"
      selectedIndex={selectedIndex}
      onChange={handleManualChange}
      vertical
    >
      <Tab.List className="relative z-10 order-last col-span-6 space-y-6">
        {features.map((feature, featureIndex) => (
          <div key={feature.name} className="relative rounded-2xl transition-colors hover:bg-gray-800/30">
            {featureIndex === selectedIndex && (
              <motion.div layoutId="activeBackground" className="absolute inset-0 bg-gray-800" initial={{ borderRadius: 16 }} />
            )}
            <div className="relative z-10 p-8">
              <feature.icon className="h-8 w-8" />
              <h3 className="mt-6 text-lg font-semibold">
                <Tab className="text-left ui-not-focus-visible:outline-none text-base text-white">
                  <span className="absolute inset-0 rounded-2xl" />
                  {feature.name}
                </Tab>
              </h3>
              <p className="mt-2 text-base text-white">{feature.description}</p>
            </div>
          </div>
        ))}
      </Tab.List>
      <div className="relative col-span-6">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <CircleBackground color="#13B5C8" className="animate-spin-slower" />
        </div>
        <PhoneFrame className="z-10 mx-auto w-full max-w-[366px]">
          <Tab.Panels as={Fragment}>
            <AnimatePresence initial={false}>
              {features.map((feature, featureIndex) =>
                selectedIndex === featureIndex ? (
                  <Tab.Panel
                    static
                    key={feature.name + changeCount}
                    className="col-start-1 row-start-1 flex focus:outline-offset-[32px] ui-not-focus-visible:outline-none"
                  >
                    <feature.screen animated custom={{ isForwards: true, changeCount }} />
                  </Tab.Panel>
                ) : null
              )}
            </AnimatePresence>
          </Tab.Panels>
        </PhoneFrame>
      </div>
    </Tab.Group>
  );
}

function FeaturesMobile() {
  let [activeIndex, setActiveIndex] = useState(0);
  let slideContainerRef = useRef<HTMLDivElement>(null);
  let slideRefs = useRef<Array<HTMLDivElement>>([]);
  const isInViewport = useRef(true);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        isInViewport.current = entries.some((entry) => entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    if (slideContainerRef.current) {
      observer.observe(slideContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isInViewport.current) {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % features.length;
          slideRefs.current[nextIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest',
          });
          return nextIndex;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        ref={slideContainerRef}
        className="-mb-4 flex snap-x snap-mandatory -space-x-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 [scrollbar-width:none] sm:-space-x-6 [&::-webkit-scrollbar]:hidden"
      >
        {features.map((feature, featureIndex) => (
          <div
            key={featureIndex}
            ref={(ref) => {
              ref && (slideRefs.current[featureIndex] = ref);
            }}
            className="w-full flex-none snap-center px-4 sm:px-6"
          >
            <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 px-5 py-6">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <CircleBackground color="#13B5C8" className={featureIndex % 2 === 1 ? 'rotate-180' : undefined} />
              </div>
              <PhoneFrame className="relative mx-auto w-full max-w-[366px]">
                <feature.screen />
              </PhoneFrame>
              <div className="absolute inset-x-0 bottom-0 bg-gray-800/95 p-6 backdrop-blur sm:p-10">
                <feature.icon className="h-8 w-8" />
                <h3 className="mt-6 text-sm font-semibold text-white sm:text-lg">{feature.name}</h3>
                <p className="mt-2 text-sm text-white">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {features.map((_, featureIndex) => (
          <button
            type="button"
            key={featureIndex}
            className={clsx('relative h-0.5 w-4 rounded-full', featureIndex === activeIndex ? 'bg-gray-300' : 'bg-gray-500')}
            aria-label={`Go to slide ${featureIndex + 1}`}
            onClick={() => {
              slideRefs.current[featureIndex].scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
              });
              setActiveIndex(featureIndex);
            }}
          >
            <span className="absolute -inset-x-1.5 -inset-y-3" />
          </button>
        ))}
      </div>
    </>
  );
}

export function PrimaryFeatures() {
  return (
    <section id="features" aria-label="Features for investing all your money" className="bg-gray-900 py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl lg:max-w-4xl text-center">
          <h2 className="text-3xl font-medium tracking-tight text-white">
            Embrace Modern Learning<br></br>Grasp Knowledge Effortlessly with Tidbits
          </h2>
          <p className="mt-2 text-lg text-white">
            We offer different ways to educate — bite-sized info, interactive demos, and quick videos to help users fully understand your product. The more they
            learn, the more they’ll stay engaged, reducing the chance of switching to other solutions.
          </p>
        </div>
      </Container>
      <div className="mt-16 md:hidden">
        <FeaturesMobile />
      </div>
      <Container className="hidden md:mt-20 md:block">
        <FeaturesDesktop />
      </Container>
    </section>
  );
}
