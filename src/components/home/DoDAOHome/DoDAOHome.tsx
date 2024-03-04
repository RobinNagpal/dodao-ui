'use client';

import FullPageModal from '@/components/core/modals/FullPageModal';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { SendEmailInput, useSendEmailMutation } from '@/graphql/generated/generated-types';
import backgroundCallToAction from '@/images/background-call-to-action.jpg';
import backgroundFaqs from '@/images/background-faqs.jpg';
import AAVE from '@/images/DAO/AAVE.png';
import Balancer from '@/images/DAO/Balancer.png';
import Compound from '@/images/DAO/Compound.png';
import Harmony from '@/images/DAO/Harmony.png';
import Near from '@/images/DAO/Near.png';
import Uniswap from '@/images/DAO/Uniswap.png';
import screenshotCourses from '@/images/screenshots/courses.png';
import screenshotGuides from '@/images/screenshots/guides.jpg';
import screenshotSimulations from '@/images/screenshots/simulaitons.png';
import screenshotBytes from '@/images/screenshots/tidbits.jpg';
import screenshotTimelines from '@/images/screenshots/timelines.png';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { TypeAnimation } from 'react-type-animation';

export function Container({ className, ...props }: any) {
  return <div className={clsx('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props} />;
}

const baseStyles: any = {
  solid:
    'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline: 'group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none',
};

const variantStyles: any = {
  solid: {
    slate: 'bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
    blue: 'bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600',
    white: 'bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white',
  },
  outline: {
    slate:
      'ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
    white: 'ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
  },
};

export function Button({ variant = 'solid', color = 'slate', className, href, ...props }: any) {
  className = clsx(baseStyles[variant], variantStyles[variant][color], className);

  return href ? <Link href={href} className={className} {...props} /> : <button className={className} {...props} />;
}

const formClasses =
  'block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm';

function Label({ id, children }: any) {
  return (
    <label htmlFor={id} className="mb-3 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

export function TextField({ id, label, type = 'text', className = '', onChange, ...props }: any) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <input id={id} type={type} {...props} className={formClasses} onChange={onChange} />
    </div>
  );
}

export function TextAreaField({ id, label, placeholder, className = '', minLength = 1000, onChange, ...props }: any) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <textarea id={id} minLength={minLength} {...props} className={formClasses} placeholder={placeholder} onChange={onChange} />
    </div>
  );
}

export function SelectField({ id, label, className = '', onChange, ...props }: any) {
  return (
    <div className={className}>
      {label && <Label id={id}>{label}</Label>}
      <select id={id} {...props} className={clsx(formClasses, 'pr-8')} onChange={onChange} />
    </div>
  );
}
function ContactModal({ open, onClose }: any) {
  const { showNotification } = useNotificationContext();
  const [sendEmailMutation] = useSendEmailMutation();
  const [form, setForm] = useState<SendEmailInput>({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await sendEmailMutation({ variables: { input: form } });
      showNotification({
        type: 'success',
        message: 'Email sent successfully',
      });
      onClose();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Error sending email',
      });
      console.error('Error sending email:', error);
    }
  };

  return (
    <FullPageModal open={open} onClose={onClose} title={'Get started for free'}>
      <div className="p-16">
        <form action="#" className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2" onSubmit={handleSubmit}>
          <TextField label="First name" id="firstName" name="firstName" type="text" autoComplete="given-name" required onChange={handleChange} />
          <TextField label="Last name" id="lastName" name="lastName" type="text" autoComplete="family-name" required onChange={handleChange} />
          <TextField
            className="col-span-full"
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            onChange={handleChange}
          />
          <TextAreaField
            className="col-span-full"
            label="Message"
            name="message"
            placeholder="Enter your message here"
            required
            minLength={30}
            onChange={handleChange}
          />

          <div className="col-span-full">
            <Button type="submit" variant="solid" color="blue" className="w-full">
              <span>
                Submit <span aria-hidden="true">&rarr;</span>
              </span>
            </Button>
          </div>
        </form>
      </div>
    </FullPageModal>
  );
}

export function Hero() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <Container className="pb-16 pt-20 text-center lg:pt-32">
      <h1 className="mx-auto max-w-4xl font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-7xl">
        Empower Your Customers with{' '}
        <span className="relative whitespace-nowrap text-blue-600">
          <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute left-0 top-2/3 h-[0.58em] w-full fill-blue-300/70" preserveAspectRatio="none">
            <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
          </svg>
          <span className="relative">DoDAO:</span>
        </span>{' '}
        The Ultimate Customer Education Platform
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
        Elevate Customer Satisfaction and Streamline Support Costs through an All-Inclusive Knowledge Hub.
      </p>
      <div className="mt-10 flex justify-center gap-x-6">
        <Button onClick={() => setShowContactModal(true)}>Get 1 month free</Button>
        {/*<Button href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" variant="outline">
          <svg aria-hidden="true" className="h-3 w-3 flex-none fill-blue-600 group-active:fill-current">
            <path d="m9.997 6.91-7.583 3.447A1 1 0 0 1 1 9.447V2.553a1 1 0 0 1 1.414-.91L9.997 5.09c.782.355.782 1.465 0 1.82Z" />
          </svg>
          <span className="ml-3">Watch video</span>
        </Button>*/}
      </div>
      <div className="mt-8">
        <TypeAnimation
          omitDeletionAnimation={true}
          sequence={[
            'Educated customers make confident buying decisions.',
            2000,
            'Knowledge empowers loyalty and brand trust.',
            2000,
            'Informed customers become brand ambassadors.',
            2000,
            'Understanding products enhances user experience.',
            2000,
            'Educate today, cultivate lasting relationships tomorrow.',
            2000,
            'Knowledge drives satisfaction, satisfaction drives sales.',
            2000,
          ]}
          style={{ fontSize: '3em' }}
          repeat={Infinity}
        />
      </div>
      <div className="mt-36 lg:mt-16">
        <p className="font-display text-base text-slate-900">Serving Industry Leaders</p>
        <ul role="list" className="mt-8 flex items-center justify-center gap-x-8 sm:flex-col sm:gap-x-0 sm:gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0">
          {[
            [
              { name: 'AAVE', logo: AAVE, height: 150 },
              { name: 'Compound', logo: Compound, height: 60 },
              { name: 'Uniswap', logo: Uniswap, height: 100 },
            ],
            [
              { name: 'Balancer', logo: Balancer, height: 120 },
              { name: 'Harmony', logo: Harmony, height: 70 },
              { name: 'Near', logo: Near, height: 150 },
            ],
          ].map((group, groupIndex) => (
            <li key={groupIndex}>
              <ul role="list" className="flex flex-col items-center gap-y-8 sm:flex-row sm:gap-x-12 sm:gap-y-0">
                {group.map((company) => (
                  <li key={company.name} className="flex">
                    <Image src={company.logo} alt={company.name} unoptimized height={company.height} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
    </Container>
  );
}

const primaryFeatures = [
  {
    title: 'Guides',
    description: 'Demystify complex concepts with easy-to-follow guides designed to boost customer understanding.',
    image: screenshotGuides,
  },
  {
    title: 'Tidbits',
    description: 'Impart crucial insights in under a minute with our captivating, digestible content.',
    image: screenshotBytes,
  },
  {
    title: 'Clickable Demos',
    description: 'Invite customers to immerse themselves in your product or service through guided, interactive demos.',
    image: screenshotSimulations,
  },
  {
    title: 'Courses',
    description: 'Deepen customer knowledge and engagement through structured, topical courses designed to educate and inspire.',
    image: screenshotCourses,
  },
  {
    title: 'Timelines',
    description: 'Keep customers informed with timely updates on product development and releases.',
    image: screenshotTimelines,
  },
];

// ################################### Primary Features Start ###################################
export function PrimaryFeatures() {
  let [tabOrientation, setTabOrientation] = useState('horizontal');

  useEffect(() => {
    let lgMediaQuery = window.matchMedia('(min-width: 1024px)');

    function onMediaQueryChange({ matches }: any) {
      setTabOrientation(matches ? 'vertical' : 'horizontal');
    }

    onMediaQueryChange(lgMediaQuery);
    lgMediaQuery.addEventListener('change', onMediaQueryChange);

    return () => {
      lgMediaQuery.removeEventListener('change', onMediaQueryChange);
    };
  }, []);

  return (
    <section id="features" aria-label="Features for running your books" className="relative overflow-hidden bg-blue-600 pb-28 pt-20 sm:py-32">
      <Image
        className="absolute left-1/2 top-1/2 max-w-xs translate-x-[-44%] translate-y-[-42%]"
        src={backgroundCallToAction}
        alt=""
        width={2245}
        height={1636}
        unoptimized
      />
      <Container className="relative">
        <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
            Mastering Customer Engagement: DoDAO&apos;s Pioneering Platform and Resources
          </h2>
          <p className="mt-6 text-lg tracking-tight text-blue-100">
            Discover all you need for superior customer education with DoDAO&apos;s innovative features. Just dive in, and don&apos;t sweat the small stuff –
            we&apos;ve got it covered
          </p>
        </div>
        <Tab.Group
          as="div"
          className="mt-16 grid grid-cols-1 items-stretch gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0"
          vertical={tabOrientation === 'vertical'}
        >
          {({ selectedIndex }) => (
            <>
              <div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
                <Tab.List className="relative z-10 flex gap-x-4 whitespace-nowrap px-4 sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
                  {primaryFeatures.map((feature, featureIndex) => (
                    <div
                      key={feature.title}
                      className={clsx(
                        'group relative rounded-full px-4 lg:rounded-l-xl lg:rounded-r-none lg:p-6',
                        selectedIndex === featureIndex
                          ? 'bg-white lg:bg-white/10 lg:ring-1 lg:ring-inset lg:ring-white/10'
                          : 'hover:bg-white/10 lg:hover:bg-white/5'
                      )}
                    >
                      <h3>
                        <Tab
                          className={clsx(
                            'font-display text-lg [&:not(:focus-visible)]:focus:outline-none',
                            selectedIndex === featureIndex ? 'text-blue-600 lg:text-white' : 'text-blue-100 hover:text-white lg:text-white'
                          )}
                        >
                          <span className="absolute inset-0 rounded-full lg:rounded-l-xl lg:rounded-r-none" />
                          {feature.title}
                        </Tab>
                      </h3>
                      <p className={clsx(' hidden text-sm lg:block', selectedIndex === featureIndex ? 'text-white' : 'text-blue-100 group-hover:text-white')}>
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </Tab.List>
              </div>
              <Tab.Panels className="lg:col-span-7">
                {primaryFeatures.map((feature) => (
                  <Tab.Panel key={feature.title} unmount={false}>
                    {/* <div className="relative sm:px-6 lg:hidden">
                      <div className="absolute -inset-x-4 bottom-[-4.25rem] top-[-6.5rem] bg-white/10 ring-1 ring-inset ring-white/10 sm:inset-x-0 sm:rounded-t-xl" />
                      <p className="relative mx-auto max-w-2xl text-base text-white sm:text-center">
                        {feature.description}
                      </p>
                    </div> */}
                    <div className="mt-10 w-[45rem] overflow-hidden rounded-xl bg-slate-50 shadow-xl shadow-blue-900/20 sm:w-auto lg:mt-0 lg:w-[67.8125rem]">
                      <Image className="w-full " src={feature.image} alt="" priority sizes="(min-width: 1024px) 67.8125rem, (min-width: 640px) 100vw, 45rem" />
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </>
          )}
        </Tab.Group>
      </Container>
    </section>
  );
}

// ################################### Secondary Features Start ###################################

const features = [
  {
    name: 'Education',
    summary: 'Holistic Learning Solutions',
    description:
      "DoDAO is more than a platform; it's a complete solution for customer education. It empowers your customers with vital knowledge, helping them utilize your products and services to their fullest potential.",

    icon: function AcademyIcon() {
      let id = useId();
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
          />
        </svg>
      );
    },
  },
  {
    name: 'Cost Efficiency',
    summary: 'Efficiency through Information',
    description:
      'DoDAO believes in the power of information for cost-efficiency. By providing all necessary information to your customers, you can significantly minimize your support-related expenses.',

    icon: function DollarIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    },
  },
  {
    name: 'Engagement',
    summary: 'Dynamic Learning Interactions',
    description:
      'DoDAO transforms every customer interaction into a learning experience. By fostering dynamic education, it helps turn your customers into brand advocates.',
    icon: function HandShakeIcon() {
      return (
        <svg fill="none" viewBox="0 0 48 48" strokeWidth={3} stroke="currentColor" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
          <g data-name="Layer 2">
            <path fill="none" data-name="invisible box" d="M0 0h48v48H0z" />
            <g data-name="Health Icons">
              <path d="M44 30h-1.2L26.4 13.6a1.9 1.9 0 0 0-2.8 0l-5.9 5.9a1 1 0 0 1-1.4 0L14.8 18l1.6-1.6L25 7.8l8.6 8.6a2 2 0 0 0 1.4.6h9a2 2 0 0 0 0-4h-8.2l-9.4-9.4a1.9 1.9 0 0 0-2.8 0L14.2 13H4a2 2 0 0 0 0 4h6.6a2.8 2.8 0 0 0 .7 3.1l2.2 2.2a5 5 0 0 0 7 0l4.5-4.5 15.6 15.6a2 2 0 0 0 1.4.6h2a2 2 0 0 0 0-4Z" />
              <path d="M31.4 27.6a2 2 0 0 0-2.8 2.8l7 7a1.9 1.9 0 0 0 2.8 0 1.9 1.9 0 0 0 0-2.8Zm-6 3a2 2 0 0 0-2.8 2.8l7 7a1.9 1.9 0 0 0 2.8 0 1.9 1.9 0 0 0 0-2.8Zm-7 2a2 2 0 0 0-2.8 2.8l7 7a1.9 1.9 0 0 0 2.8 0 1.9 1.9 0 0 0 0-2.8Zm-11-2A2 2 0 0 0 6 30H4a2 2 0 0 0 0 4h1.2l10.4 10.4a1.9 1.9 0 0 0 2.8 0 1.9 1.9 0 0 0 0-2.8Z" />
            </g>
          </g>
        </svg>
      );
    },
  },
  {
    name: 'Customer Relationships',
    summary: 'Nurturing Long-term Bonds',
    description:
      'DoDAO goes beyond business transactions to create lasting relationships with your customers. Continuous learning and engagement are key to nurturing these bonds.',
    icon: function HeartIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      );
    },
  },
  {
    name: 'Empowerment',
    summary: 'Enabling Customer Discovery',
    description:
      'DoDAO paves the way for customer discovery with clear and comprehensive explanations of your products and services. This instills a sense of trust and empowerment in your customers.',
    icon: function LightBulbIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
      );
    },
  },
  {
    name: 'Low churn rates',
    summary: 'Sustaining Customer Engagement',
    description:
      'With DoDAO, customer engagement is not just a goal, but a journey. Our education platform keeps customers more engaged and connected than ever, significantly reducing churn and increasing loyalty.',
    icon: function ChevronDownIcon() {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
        </svg>
      );
    },
  },
];

function Feature({ feature, className, ...props }: any) {
  return (
    <div className={clsx(className)} {...props}>
      <div className={clsx('w-9 rounded-lg')}>
        <svg aria-hidden="true" className="h-9 w-9" fill="none">
          <feature.icon />
        </svg>
      </div>
      <h3 className={clsx('mt-6 text-sm font-medium', 'text-blue-600')}>{feature.name}</h3>
      <p className="mt-2 font-display text-xl text-slate-900">{feature.summary}</p>
      <p className="mt-4 text-sm text-slate-600">{feature.description}</p>
    </div>
  );
}

// function FeaturesMobile() {
//   return (
//     <div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:hidden">
//       {features.map((feature) => (
//         <div key={feature.name}>
//           <Feature feature={feature} className="mx-auto max-w-2xl" isActive />
//           <div className="relative mt-10 pb-10">
//             <div className="absolute -inset-x-4 bottom-0 top-8 bg-slate-200 sm:-inset-x-6" />
//             <div className="relative mx-auto w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
//               <Image
//                 className="w-full"
//                 src={feature.image}
//                 alt=""
//                 sizes="52.75rem"
//               />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }
function FeaturesDesktop() {
  return (
    <div className="lg:mt-20 lg:block hidden ">
      <div className="grid grid-cols-3 grid-rows-2 gap-x-8 gap-y-8">
        {features.map((feature, featureIndex) => (
          <Feature
            key={feature.name}
            feature={{
              ...feature,
              name: (
                <div className="">
                  <span className="absolute inset-0" />
                  {feature.name}
                </div>
              ),
            }}
            className="relative"
          />
        ))}
      </div>
    </div>
  );
}

export function SecondaryFeatures() {
  return (
    <section id="secondary-features" aria-label="Features for simplifying everyday business tasks" className="pb-14 pt-20 sm:pb-20 sm:pt-32 lg:pb-32">
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">DoDAO: Revolutionizing Customer Engagement</h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            With DoDAO, empower your customers, streamline support costs, and cultivate enduring relationships through comprehensive, engaging education.
          </p>
        </div>

        <FeaturesDesktop />
      </Container>
    </section>
  );
}

// ################################### Call to action ###################################

export function CallToAction() {
  return (
    <section id="get-started-today" className="relative overflow-hidden bg-blue-600 py-32">
      <Image
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundCallToAction}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">Get started today</h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Welcome to your trial with DoDAO, your gateway to revolutionizing customer education. Experience cost-efficiency, customer empowerment, engagement,
            and reduced churn while gaining valuable customer insights. Embark on a journey to redefine your customer relationships today.
          </p>
          <Button href="/contact" color="white" className="mt-10">
            Get 1 month free
          </Button>
        </div>
      </Container>
    </section>
  );
}

// ################################### Pricing ###################################

function SwirlyDoodle({ className }: any) {
  return (
    <svg aria-hidden="true" viewBox="0 0 281 40" className={className} preserveAspectRatio="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M240.172 22.994c-8.007 1.246-15.477 2.23-31.26 4.114-18.506 2.21-26.323 2.977-34.487 3.386-2.971.149-3.727.324-6.566 1.523-15.124 6.388-43.775 9.404-69.425 7.31-26.207-2.14-50.986-7.103-78-15.624C10.912 20.7.988 16.143.734 14.657c-.066-.381.043-.344 1.324.456 10.423 6.506 49.649 16.322 77.8 19.468 23.708 2.65 38.249 2.95 55.821 1.156 9.407-.962 24.451-3.773 25.101-4.692.074-.104.053-.155-.058-.135-1.062.195-13.863-.271-18.848-.687-16.681-1.389-28.722-4.345-38.142-9.364-15.294-8.15-7.298-19.232 14.802-20.514 16.095-.934 32.793 1.517 47.423 6.96 13.524 5.033 17.942 12.326 11.463 18.922l-.859.874.697-.006c2.681-.026 15.304-1.302 29.208-2.953 25.845-3.07 35.659-4.519 54.027-7.978 9.863-1.858 11.021-2.048 13.055-2.145a61.901 61.901 0 0 0 4.506-.417c1.891-.259 2.151-.267 1.543-.047-.402.145-2.33.913-4.285 1.707-4.635 1.882-5.202 2.07-8.736 2.903-3.414.805-19.773 3.797-26.404 4.829Zm40.321-9.93c.1-.066.231-.085.29-.041.059.043-.024.096-.183.119-.177.024-.219-.007-.107-.079ZM172.299 26.22c9.364-6.058 5.161-12.039-12.304-17.51-11.656-3.653-23.145-5.47-35.243-5.576-22.552-.198-33.577 7.462-21.321 14.814 12.012 7.205 32.994 10.557 61.531 9.831 4.563-.116 5.372-.288 7.337-1.559Z"
      />
    </svg>
  );
}

function CheckIcon({ className }: any) {
  return (
    <svg aria-hidden="true" className={clsx('h-6 w-6 flex-none fill-current stroke-current', className)}>
      <path
        d="M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z"
        strokeWidth={0}
      />
      <circle cx={12} cy={12} r={8.25} fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Plan({ name, price, description, cta, href, features, featured = false }: any) {
  return (
    <section className={clsx('flex flex-col rounded-3xl px-6 sm:px-8', featured ? 'order-first bg-blue-600 py-8 lg:order-none' : 'lg:py-8')}>
      <h3 className="mt-5 font-display text-lg text-white">{name}</h3>
      <p className={clsx('mt-2 text-base', featured ? 'text-white' : 'text-slate-400')}>{description}</p>
      <p className="order-first font-display text-5xl font-light tracking-tight text-white">{price}</p>
      <ul role="list" className={clsx('order-last mt-10 flex flex-col gap-y-3 text-sm', featured ? 'text-white' : 'text-slate-200')}>
        {(features as string[]).map((feature, index) => (
          <li key={feature + index} className="flex">
            <CheckIcon className={featured ? 'text-white' : 'text-slate-400'} />
            <span className="ml-4">{feature}</span>
          </li>
        ))}
      </ul>
      <Button href={href} variant={featured ? 'solid' : 'outline'} color="white" className="mt-8" aria-label={`Get started with the ${name} plan for ${price}`}>
        {cta}
      </Button>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" aria-label="Pricing" className="bg-slate-900 py-20 sm:py-32">
      <Container>
        <div className="md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            <span className="relative whitespace-nowrap">
              <SwirlyDoodle className="absolute left-0 top-1/2 h-[1em] w-full fill-blue-400" />
              <span className="relative">{'Choose the Perfect Plan'}</span>
            </span>{' '}
            and Grow Your Business
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {
              "DoDAO's customer education platform empowers businesses to engage, educate, and retain customers by sharing all the information they need, reducing the need for costly support teams and improving customer satisfaction."
            }
          </p>
        </div>
        <div className="-mx-4 mt-16 grid max-w-2xl grid-cols-1 gap-y-10 sm:mx-auto lg:-mx-8 lg:max-w-none lg:grid-cols-3 xl:mx-0 xl:gap-x-8">
          <Plan
            name="Standard"
            price="$350 per month"
            description="Kickstart your customer education journey economically."
            href="/contact"
            cta="Get Started with Standard"
            features={[
              'Access to Basic Guides and FAQs',
              'Up to 5 Customizable Courses',
              'Unlimited Tidbits Content',
              'Interactive Quizzes',
              'Standard Timelines',
              'Basic Clickable Demos',
              'Email Support',
            ]}
          />
          <Plan
            featured
            name="Pro"
            price="$600 per month"
            description="Amplify engagement with advanced features and support."
            href="/contact"
            cta="Upgrade to pro"
            features={[
              'All Standard Plan Features',
              'Unlimited Customizable Courses',
              'Advanced Clickable Demos',
              'Priority Email Support',
              'Access to Pro-exclusive Guides',
              'Advanced Timelines with Customization',
              'API Integration',
            ]}
          />
          <Plan
            name="Enterprise"
            price="Personalized Pricing"
            description="Achieve unparalleled customization for superior customer experience."
            href="/contact"
            cta="Contact Us for Enterprise"
            features={[
              'All Pro Plan Features',
              'Dedicated Account Manager',
              'Unlimited API Integration',
              'Priority Customer Support (Phone and Email)',
              'Tailored Content Creation Assistance',
              'Custom Reporting and Analytics',
              'Custom Branding for Education Platform',
              'Tailored Content Creation Assistance',
            ]}
          />
        </div>
        <p className="mt-4 text-lg text-slate-400 md:text-center">
          Looking for a Custom Plan? Contact Our Sales Team to Discuss Your Specific Needs and Find the Perfect Solution for Your Business.
        </p>
      </Container>
    </section>
  );
}

// ################################### FAQs ###################################

const faqs = [
  [
    {
      question: 'What is DoDAO?',
      answer:
        'DoDAO is a comprehensive customer education platform designed to empower businesses to effectively share knowledge about their products and services. It enables you to engage, educate, and cultivate long-lasting relationships with your customers, while also reducing support costs.',
    },
    {
      question: 'How can DoDAO help me save on support costs?',
      answer:
        'By offering a robust platform where customers can easily access all the information they need, DoDAO reduces the reliance on customer support teams. This means lower overhead costs for your business and faster, more efficient customer service.',
    },
    {
      question: 'How does DoDAO engage and educate customers?',
      answer:
        'DoDAO offers a variety of interactive educational resources, including guides, quizzes, bite-sized content, clickable demos, and more. These engaging tools make learning about your products and services both fun and effective for your customers.',
    },
  ],
  [
    {
      question: 'How does DoDAO help create long-term customer relationships?',
      answer:
        'By providing comprehensive and accessible knowledge, DoDAO fosters trust and satisfaction among your customers. This, combined with continuous learning opportunities, helps to build strong, lasting relationships.',
    },
    {
      question: 'How does DoDAO empower customers?',
      answer:
        'DoDAO empowers customers by providing them with the tools and resources they need to fully understand and appreciate your products or services. It helps customers to become more confident and capable, which enhances their overall experience with your brand.',
    },
    {
      question: 'How does DoDAO reduce churn rates?',
      answer:
        'By providing engaging, user-friendly educational content, DoDAO keeps customers invested in your brand. This high level of engagement reduces churn rates by promoting customer loyalty and satisfaction.',
    },
  ],
  [
    {
      question: 'What insights can I gain about my customers through DoDAO?',
      answer:
        "DoDAO provides valuable insights into your customers' behaviors and preferences through their interactions with the platform's educational content. This data can be used to personalize customer experiences and further enhance satisfaction and loyalty.",
    },
    {
      question: 'What kinds of businesses can benefit from DoDAO?',
      answer:
        "Any business that aims to provide its customers with comprehensive knowledge about its products or services can benefit from DoDAO. Whether you're a small start-up or a large corporation, DoDAO can be tailored to meet your specific customer education needs.",
    },
    {
      question: 'How do I get started with DoDAO?',
      answer:
        'Getting started with DoDAO is simple. Choose the pricing plan that suits your business needs and start your journey towards enhanced customer education and engagement. For any specific queries or customized requirements, feel free to contact our support team.',
    },
  ],
];

export function Faqs() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative overflow-hidden bg-slate-50 py-20 sm:py-32">
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={backgroundFaqs}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 id="faq-title" className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team and if you’re lucky someone will get back to you.
          </p>
        </div>
        <ul role="list" className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">{faq.question}</h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

// ################################### Footer ###################################

export function Logo(props: any) {
  return (
    <svg width="160" height="120" viewBox="0 0 18145 5481" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="18145" height="5481" fill="white" />
      <rect
        width="253.146"
        height="1304.09"
        rx="38"
        transform="matrix(0.721709 -0.692197 0.721709 0.692197 2737.03 2188.41)"
        fill="url(#paint0_linear_57_170)"
      />
      <path
        d="M2578.25 3497.78C2563.1 3483.25 2563.1 3459.7 2578.25 3445.17L3495.01 2565.89L3677.71 2741.12L2760.95 3620.4C2745.8 3634.92 2721.24 3634.92 2706.1 3620.4L2578.25 3497.78Z"
        fill="url(#paint1_linear_57_170)"
      />
      <path
        d="M2000.45 2593.15C1985.3 2578.62 1985.3 2555.07 2000.45 2540.54L2128.3 2417.92C2143.44 2403.4 2168 2403.4 2183.14 2417.92L3096.29 3293.72L2913.59 3468.95L2000.45 2593.15Z"
        fill="url(#paint2_linear_57_170)"
      />
      <path
        d="M2156.81 2742.82L3074.8 1862.38C3089.94 1847.85 3114.5 1847.85 3129.65 1862.38L3257.5 1985C3272.64 1999.53 3272.64 2023.08 3257.5 2037.61L2339.51 2918.05L2156.81 2742.82Z"
        fill="url(#paint3_linear_57_170)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2395.11 2440.79C2365.61 2469.08 2317.79 2469.08 2288.3 2440.79L2027.42 2190.58C2027.05 2190.22 2027.05 2189.64 2027.42 2189.28C2027.8 2188.92 2027.79 2188.33 2027.41 2187.97C2025.93 2186.57 2024.45 2185.16 2022.98 2183.75C1836.97 2005.35 1759.71 1762.14 1791.2 1529.9C1992.64 1609.15 2232.71 1570.33 2396.3 1413.43C2554.3 1261.89 2597.46 1041.91 2525.77 852.977C2757.97 832.978 2997.41 908.216 3175.15 1078.69C3176.85 1080.32 3178.54 1081.96 3180.23 1083.6C3180.23 1083.6 3180.23 1083.6 3180.23 1083.6C3180.23 1083.6 3180.24 1083.6 3180.24 1083.6C3180.24 1083.6 3180.24 1083.6 3180.24 1083.6C3180.25 1083.6 3180.25 1083.6 3180.25 1083.6L3441.8 1334.45C3471.3 1362.74 3471.3 1408.61 3441.8 1436.9L2395.11 2440.79Z"
        fill="#4A96FD"
      />
      <g filter="url(#filter0_d_57_170)">
        <circle r="461.394" transform="matrix(-0.721709 0.692196 0.721709 0.692197 1993.88 1029.48)" fill="#4A96FD" />
      </g>
      <path
        d="M2153.91 2313.29C2153.91 2313.29 2524.67 1839.33 2640.73 1506.4C2756.78 1173.47 2787.24 870.763 2787.24 870.763C2787.24 870.763 2877.94 890.218 2973.66 937.248C3030.98 965.408 3090.79 1006.1 3133.83 1043.02C3170.6 1074.55 3196.25 1100.98 3225.66 1128.68C3245.97 1147.81 3366.95 1260.32 3439.9 1328.15C3470.58 1356.66 3470.96 1403.72 3440.77 1432.72L2393.42 2439.07C2363.53 2467.79 2315.03 2467.82 2285.12 2439.13L2153.91 2313.29Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2604.72 3243.52C2634.22 3271.81 2634.22 3317.67 2604.72 3345.96L2343.84 3596.17C2343.47 3596.53 2342.86 3596.53 2342.49 3596.17C2342.11 3595.81 2341.5 3595.81 2341.12 3596.18C2339.66 3597.6 2338.2 3599.02 2336.72 3600.43C2150.71 3778.83 1897.14 3852.93 1655 3822.74C1737.63 3629.53 1697.15 3399.28 1533.56 3242.38C1375.56 3090.84 1146.19 3049.45 949.211 3118.21C928.358 2895.5 1006.8 2665.85 1184.55 2495.37C1186.25 2493.74 1187.96 2492.12 1189.67 2490.5C1189.67 2490.5 1189.67 2490.5 1189.67 2490.49C1189.66 2490.49 1189.66 2490.49 1189.67 2490.48L1451.22 2239.63C1480.71 2211.34 1528.53 2211.34 1558.03 2239.63L2604.72 3243.52Z"
        fill="#508BFE"
      />
      <g filter="url(#filter1_d_57_170)">
        <circle r="461.394" transform="matrix(0.721709 0.692197 0.721709 -0.692196 1133.24 3628.34)" fill="#508BFE" />
      </g>
      <path
        d="M2471.79 3474.85C2471.79 3474.85 1977.62 3119.26 1630.5 3007.94C1283.37 2896.63 967.757 2867.42 967.757 2867.42C967.757 2867.42 988.042 2780.43 1037.08 2688.62C1066.44 2633.65 1108.86 2576.28 1147.36 2535C1180.24 2499.74 1207.79 2475.13 1236.67 2446.93C1256.62 2427.45 1373.92 2311.43 1444.63 2241.46C1474.37 2212.03 1523.43 2211.66 1553.67 2240.61L2602.94 3245.14C2632.88 3273.8 2632.9 3320.33 2602.98 3349.02L2471.79 3474.85Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3440.63 3041.04C3470.12 3012.75 3517.94 3012.76 3547.44 3041.04L3808.32 3291.25C3808.69 3291.61 3808.69 3292.2 3808.32 3292.56C3807.94 3292.92 3807.94 3293.5 3808.32 3293.86C3809.8 3295.26 3811.28 3296.67 3812.76 3298.08C3998.76 3476.49 4076.03 3719.69 4044.54 3951.93C3843.1 3872.68 3603.03 3911.51 3439.44 4068.4C3281.44 4219.94 3238.28 4439.93 3309.97 4628.86C3077.77 4648.86 2838.33 4573.62 2660.58 4403.14C2659.73 4402.32 2658.88 4401.51 2658.04 4400.69C2657.19 4399.87 2656.35 4399.05 2655.51 4398.23C2655.51 4398.23 2655.5 4398.23 2655.5 4398.23C2655.49 4398.24 2655.49 4398.24 2655.49 4398.23L2393.94 4147.38C2364.44 4119.09 2364.44 4073.22 2393.94 4044.93L3440.63 3041.04Z"
        fill="#6E7EFF"
      />
      <g filter="url(#filter2_d_57_170)">
        <ellipse rx="461.394" ry="461.394" transform="matrix(0.721709 -0.692196 -0.721709 -0.692197 3841.85 4452.35)" fill="#6E7EFF" />
      </g>
      <path
        d="M3681.83 3168.54C3681.83 3168.54 3311.07 3642.5 3195.01 3975.43C3078.95 4308.36 3048.5 4611.07 3048.5 4611.07C3048.5 4611.07 2957.8 4591.61 2862.07 4544.58C2804.75 4516.42 2744.95 4475.73 2701.9 4438.81C2665.14 4407.28 2639.48 4380.85 2610.07 4353.15C2589.77 4334.02 2468.79 4221.51 2395.83 4153.68C2365.16 4125.17 2364.78 4078.11 2394.97 4049.11L3442.32 3042.76C3472.2 3014.04 3520.71 3014.01 3550.62 3042.7L3681.83 3168.54Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3233.72 2238.74C3204.23 2210.45 3204.23 2164.58 3233.72 2136.29L3494.6 1886.08C3494.97 1885.72 3495.58 1885.72 3495.96 1886.08C3496.33 1886.44 3496.94 1886.44 3497.32 1886.08C3498.78 1884.65 3500.25 1883.24 3501.72 1881.82C3687.73 1703.42 3941.3 1629.32 4183.44 1659.52C4100.82 1852.72 4141.3 2082.98 4304.88 2239.87C4462.89 2391.41 4692.25 2432.81 4889.23 2364.05C4910.08 2586.75 4831.64 2816.4 4653.89 2986.88C4652.19 2988.51 4650.49 2990.13 4648.77 2991.75C4648.77 2991.75 4648.77 2991.76 4648.77 2991.76C4648.78 2991.76 4648.78 2991.77 4648.77 2991.77L4387.22 3242.62C4357.73 3270.91 4309.91 3270.91 4280.41 3242.62L3233.72 2238.74Z"
        fill="#4560FD"
      />
      <g filter="url(#filter3_d_57_170)">
        <ellipse rx="461.394" ry="461.394" transform="matrix(-0.721709 -0.692197 -0.721709 0.692196 4705.2 1853.92)" fill="#4560FD" />
      </g>
      <path
        d="M3366.65 2007.4C3366.65 2007.4 3860.82 2362.99 4207.95 2474.3C4555.07 2585.62 4870.69 2614.82 4870.69 2614.82C4870.69 2614.82 4850.4 2701.82 4801.37 2793.63C4772 2848.6 4729.58 2905.96 4691.08 2947.25C4658.21 2982.51 4630.65 3007.12 4601.77 3035.32C4581.83 3054.8 4464.52 3170.82 4393.81 3240.79C4364.07 3270.22 4315.01 3270.59 4284.77 3241.64L3235.5 2237.11C3205.56 2208.44 3205.54 2161.92 3235.46 2133.23L3366.65 2007.4Z"
        fill="white"
        fillOpacity="0.2"
      />
      <g filter="url(#filter4_d_57_170)">
        <path
          d="M6644.4 4050C7396.8 4050 7918.8 3574.8 7918.8 2851.2C7918.8 2127.6 7396.8 1648.8 6644.4 1648.8H5697.6V4050H6644.4ZM6644.4 3600H6208.8V2098.8H6644.4C7137.6 2098.8 7396.8 2426.4 7396.8 2851.2C7396.8 3258 7119.6 3600 6644.4 3600ZM9077.18 4093.2C9653.18 4093.2 9998.78 3675.6 9998.78 3178.8C9998.78 2685.6 9653.18 2268 9077.18 2268C8504.78 2268 8159.18 2685.6 8159.18 3178.8C8159.18 3675.6 8504.78 4093.2 9077.18 4093.2ZM9077.18 3686.4C8792.78 3686.4 8634.38 3452.4 8634.38 3178.8C8634.38 2908.8 8792.78 2674.8 9077.18 2674.8C9361.58 2674.8 9523.58 2908.8 9523.58 3178.8C9523.58 3452.4 9361.58 3686.4 9077.18 3686.4ZM11295.6 4050C12048 4050 12570 3574.8 12570 2851.2C12570 2127.6 12048 1648.8 11295.6 1648.8H10348.8V4050H11295.6ZM11295.6 3600H10860V2098.8H11295.6C11788.8 2098.8 12048 2426.4 12048 2851.2C12048 3258 11770.8 3600 11295.6 3600ZM15048.9 4050L14123.7 1648.8H13482.9L12554.1 4050H13137.3L13288.5 3643.2H14318.1L14465.7 4050H15048.9ZM14177.7 3193.2H13428.9L13803.3 2160L14177.7 3193.2ZM16285.2 4093.2C17012.4 4093.2 17541.6 3574.8 17541.6 2851.2C17541.6 2127.6 17012.4 1609.2 16285.2 1609.2C15561.6 1609.2 15032.4 2127.6 15032.4 2851.2C15032.4 3574.8 15561.6 4093.2 16285.2 4093.2ZM16285.2 3639.6C15842.4 3639.6 15558 3297.6 15558 2851.2C15558 2401.2 15842.4 2062.8 16285.2 2062.8C16728 2062.8 17016 2401.2 17016 2851.2C17016 3297.6 16728 3639.6 16285.2 3639.6Z"
          fill="#6B8DFA"
        />
        <path
          d="M5697.6 1648.8V1647.8H5696.6V1648.8H5697.6ZM5697.6 4050H5696.6V4051H5697.6V4050ZM6208.8 3600H6207.8V3601H6208.8V3600ZM6208.8 2098.8V2097.8H6207.8V2098.8H6208.8ZM6644.4 4051C7020.81 4051 7339.67 3932.13 7564.43 3722.68C7789.2 3513.23 7919.8 3213.25 7919.8 2851.2H7917.8C7917.8 3212.75 7787.4 3512.17 7563.07 3721.22C7338.73 3930.27 7020.39 4049 6644.4 4049V4051ZM7919.8 2851.2C7919.8 2489.15 7789.2 2188.28 7564.43 1977.92C7339.67 1767.57 7020.81 1647.8 6644.4 1647.8V1649.8C7020.39 1649.8 7338.73 1769.43 7563.07 1979.38C7787.4 2189.32 7917.8 2489.65 7917.8 2851.2H7919.8ZM6644.4 1647.8H5697.6V1649.8H6644.4V1647.8ZM5696.6 1648.8V4050H5698.6V1648.8H5696.6ZM5697.6 4051H6644.4V4049H5697.6V4051ZM6644.4 3599H6208.8V3601H6644.4V3599ZM6209.8 3600V2098.8H6207.8V3600H6209.8ZM6208.8 2099.8H6644.4V2097.8H6208.8V2099.8ZM6644.4 2099.8C6890.77 2099.8 7078.59 2181.62 7204.82 2316.38C7331.06 2451.16 7395.8 2639 7395.8 2851.2H7397.8C7397.8 2638.6 7332.94 2450.24 7206.28 2315.02C7079.61 2179.78 6891.23 2097.8 6644.4 2097.8V2099.8ZM7395.8 2851.2C7395.8 3054.37 7326.58 3241.32 7198.07 3377.46C7069.58 3513.6 6881.75 3599 6644.4 3599V3601C6882.25 3601 7070.62 3515.4 7199.53 3378.84C7328.42 3242.28 7397.8 3054.83 7397.8 2851.2H7395.8ZM9077.18 4094.2C9365.44 4094.2 9596.11 3989.7 9754.71 3822.99C9913.3 3656.29 9999.78 3427.43 9999.78 3178.8H9997.78C9997.78 3426.97 9911.47 3655.31 9753.26 3821.61C9595.06 3987.9 9364.93 4092.2 9077.18 4092.2V4094.2ZM9999.78 3178.8C9999.78 2931.97 9913.3 2704.01 9754.71 2537.76C9596.11 2371.5 9365.44 2267 9077.18 2267V2269C9364.93 2269 9595.06 2373.3 9753.26 2539.14C9911.47 2704.99 9997.78 2932.43 9997.78 3178.8H9999.78ZM9077.18 2267C8504.19 2267 8158.18 2685.1 8158.18 3178.8H8160.18C8160.18 2686.1 8505.38 2269 9077.18 2269V2267ZM8158.18 3178.8C8158.18 3427.43 8244.67 3656.29 8402.81 3822.99C8560.96 3989.7 8790.73 4094.2 9077.18 4094.2V4092.2C8791.24 4092.2 8562.01 3987.9 8404.26 3821.61C8246.5 3655.31 8160.18 3426.97 8160.18 3178.8H8158.18ZM9077.18 3685.4C8935.29 3685.4 8824.87 3627.04 8749.91 3534.57C8674.93 3442.08 8635.38 3315.42 8635.38 3178.8H8633.38C8633.38 3315.78 8673.04 3442.92 8748.36 3535.83C8823.7 3628.76 8934.68 3687.4 9077.18 3687.4V3685.4ZM8635.38 3178.8C8635.38 3043.99 8674.93 2918.22 8749.91 2826.18C8824.87 2734.16 8935.29 2675.8 9077.18 2675.8V2673.8C8934.68 2673.8 8823.7 2732.44 8748.36 2824.92C8673.04 2917.38 8633.38 3043.61 8633.38 3178.8H8635.38ZM9077.18 2675.8C9219.08 2675.8 9330.4 2734.16 9406.26 2826.19C9482.14 2918.23 9522.58 3043.99 9522.58 3178.8H9524.58C9524.58 3043.61 9484.03 2917.37 9407.81 2824.91C9331.57 2732.44 9219.69 2673.8 9077.18 2673.8V2675.8ZM9522.58 3178.8C9522.58 3315.41 9482.14 3442.08 9406.26 3534.57C9330.4 3627.04 9219.08 3685.4 9077.18 3685.4V3687.4C9219.69 3687.4 9331.57 3628.76 9407.81 3535.83C9484.03 3442.92 9524.58 3315.79 9524.58 3178.8H9522.58ZM10348.8 1648.8V1647.8H10347.8V1648.8H10348.8ZM10348.8 4050H10347.8V4051H10348.8V4050ZM10860 3600H10859V3601H10860V3600ZM10860 2098.8V2097.8H10859V2098.8H10860ZM11295.6 4051C11672 4051 11990.8 3932.13 12215.6 3722.68C12440.4 3513.23 12571 3213.25 12571 2851.2H12569C12569 3212.75 12438.6 3512.17 12214.2 3721.22C11989.9 3930.27 11671.6 4049 11295.6 4049V4051ZM12571 2851.2C12571 2489.15 12440.4 2188.28 12215.6 1977.92C11990.8 1767.57 11672 1647.8 11295.6 1647.8V1649.8C11671.6 1649.8 11989.9 1769.43 12214.2 1979.38C12438.6 2189.32 12569 2489.65 12569 2851.2H12571ZM11295.6 1647.8H10348.8V1649.8H11295.6V1647.8ZM10347.8 1648.8V4050H10349.8V1648.8H10347.8ZM10348.8 4051H11295.6V4049H10348.8V4051ZM11295.6 3599H10860V3601H11295.6V3599ZM10861 3600V2098.8H10859V3600H10861ZM10860 2099.8H11295.6V2097.8H10860V2099.8ZM11295.6 2099.8C11541.9 2099.8 11729.8 2181.62 11856 2316.38C11982.2 2451.16 12047 2639 12047 2851.2H12049C12049 2638.6 11984.1 2450.24 11857.5 2315.02C11730.8 2179.78 11542.4 2097.8 11295.6 2097.8V2099.8ZM12047 2851.2C12047 3054.37 11977.8 3241.32 11849.2 3377.46C11720.7 3513.6 11532.9 3599 11295.6 3599V3601C11533.4 3601 11721.8 3515.4 11850.7 3378.84C11979.6 3242.28 12049 3054.83 12049 2851.2H12047ZM15048.9 4050V4051H15050.4L15049.8 4049.64L15048.9 4050ZM14123.7 1648.8L14124.6 1648.44L14124.4 1647.8H14123.7V1648.8ZM13482.9 1648.8V1647.8H13482.2L13482 1648.44L13482.9 1648.8ZM12554.1 4050L12553.2 4049.64L12552.7 4051H12554.1V4050ZM13137.3 4050V4051H13138L13138.2 4050.35L13137.3 4050ZM13288.5 3643.2V3642.2H13287.8L13287.6 3642.85L13288.5 3643.2ZM14318.1 3643.2L14319 3642.86L14318.8 3642.2H14318.1V3643.2ZM14465.7 4050L14464.8 4050.34L14465 4051H14465.7V4050ZM14177.7 3193.2V3194.2H14179.1L14178.6 3192.86L14177.7 3193.2ZM13428.9 3193.2L13428 3192.86L13427.5 3194.2H13428.9V3193.2ZM13803.3 2160L13804.2 2159.66L13803.3 2157.06L13802.4 2159.66L13803.3 2160ZM15049.8 4049.64L14124.6 1648.44L14122.8 1649.16L15048 4050.36L15049.8 4049.64ZM14123.7 1647.8H13482.9V1649.8H14123.7V1647.8ZM13482 1648.44L12553.2 4049.64L12555 4050.36L13483.8 1649.16L13482 1648.44ZM12554.1 4051H13137.3V4049H12554.1V4051ZM13138.2 4050.35L13289.4 3643.55L13287.6 3642.85L13136.4 4049.65L13138.2 4050.35ZM13288.5 3644.2H14318.1V3642.2H13288.5V3644.2ZM14317.2 3643.54L14464.8 4050.34L14466.6 4049.66L14319 3642.86L14317.2 3643.54ZM14465.7 4051H15048.9V4049H14465.7V4051ZM14177.7 3192.2H13428.9V3194.2H14177.7V3192.2ZM13429.8 3193.54L13804.2 2160.34L13802.4 2159.66L13428 3192.86L13429.8 3193.54ZM13802.4 2160.34L14176.8 3193.54L14178.6 3192.86L13804.2 2159.66L13802.4 2160.34ZM16285.2 4094.2C17012.9 4094.2 17542.6 3575.37 17542.6 2851.2H17540.6C17540.6 3574.23 17011.9 4092.2 16285.2 4092.2V4094.2ZM17542.6 2851.2C17542.6 2127.03 17012.9 1608.2 16285.2 1608.2V1610.2C17011.9 1610.2 17540.6 2128.17 17540.6 2851.2H17542.6ZM16285.2 1608.2C15561.1 1608.2 15031.4 2127.04 15031.4 2851.2H15033.4C15033.4 2128.16 15562.1 1610.2 16285.2 1610.2V1608.2ZM15031.4 2851.2C15031.4 3575.36 15561.1 4094.2 16285.2 4094.2V4092.2C15562.1 4092.2 15033.4 3574.24 15033.4 2851.2H15031.4ZM16285.2 3638.6C16064.1 3638.6 15882.5 3553.21 15756.3 3412.13C15630 3271.04 15559 3074.19 15559 2851.2H15557C15557 3074.61 15628.2 3271.96 15754.8 3413.47C15881.5 3554.99 16063.5 3640.6 16285.2 3640.6V3638.6ZM15559 2851.2C15559 2626.41 15630 2429.56 15756.3 2288.92C15882.5 2148.29 16064.1 2063.8 16285.2 2063.8V2061.8C16063.5 2061.8 15881.5 2146.51 15754.8 2287.58C15628.2 2428.64 15557 2625.99 15557 2851.2H15559ZM16285.2 2063.8C16506.3 2063.8 16688.8 2148.29 16815.9 2288.92C16943.1 2429.56 17015 2626.41 17015 2851.2H17017C17017 2625.99 16944.9 2428.64 16817.4 2287.58C16689.8 2146.51 16506.9 2061.8 16285.2 2061.8V2063.8ZM17015 2851.2C17015 3074.19 16943.1 3271.04 16815.9 3412.13C16688.8 3553.21 16506.3 3638.6 16285.2 3638.6V3640.6C16506.9 3640.6 16689.8 3554.99 16817.4 3413.47C16944.9 3271.96 17017 3074.61 17017 2851.2H17015Z"
          fill="black"
        />
      </g>
      <defs>
        <filter id="filter0_d_57_170" x="1510.96" y="569.818" width="965.844" height="927.33" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_57_170" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_57_170" result="shape" />
        </filter>
        <filter id="filter1_d_57_170" x="650.32" y="3168.67" width="965.844" height="927.328" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_57_170" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_57_170" result="shape" />
        </filter>
        <filter id="filter2_d_57_170" x="3358.93" y="3992.68" width="965.844" height="927.33" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_57_170" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_57_170" result="shape" />
        </filter>
        <filter id="filter3_d_57_170" x="4222.28" y="1394.25" width="965.844" height="927.328" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_57_170" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_57_170" result="shape" />
        </filter>
        <filter id="filter4_d_57_170" x="5693.6" y="1609.2" width="11852" height="2492" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_57_170" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_57_170" result="shape" />
        </filter>
        <linearGradient id="paint0_linear_57_170" x1="126.573" y1="0" x2="126.573" y2="1304.09" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4BA8FD" />
          <stop offset="1" stopColor="#4457FC" />
        </linearGradient>
        <linearGradient id="paint1_linear_57_170" x1="2655.77" y1="3531.95" x2="3528.93" y2="2647.31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7381FF" />
          <stop offset="1" stopColor="#4560FD" />
        </linearGradient>
        <linearGradient id="paint2_linear_57_170" x1="2064.37" y1="2479.23" x2="2965.69" y2="3418.98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4B8FFD" />
          <stop offset="1" stopColor="#6877FF" />
        </linearGradient>
        <linearGradient id="paint3_linear_57_170" x1="3170.44" y1="1951.9" x2="2276.18" y2="2863.85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A97FD" />
          <stop offset="1" stopColor="#498EFD" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function NavLink({ href, children }: any) {
  return (
    <Link href={href} className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-50">
      <Container>
        <div className="py-16 flex flex-col items-center">
          <Logo className="mx-auto h-10 w-auto" />
          <nav className="mt-10 text-sm" aria-label="quick links">
            <div className="-my-1 flex justify-center gap-x-6">
              <NavLink href="#features">Features</NavLink>
              {/*<NavLink href="#testimonials">Testimonials</NavLink>*/}
              <NavLink href="#pricing">Pricing</NavLink>
            </div>
          </nav>
        </div>
        <div className="flex flex-col items-center border-t border-slate-400/10 py-10 sm:flex-row-reverse sm:justify-between">
          <div className="flex gap-x-6">
            {/*<Link
              href="https://twitter.com"
              className="group"
              aria-label="TaxPal on Twitter"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 22 5.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.073 4.073 0 0 1 2.8 9.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.093 4.093 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 2 18.407a11.615 11.615 0 0 0 6.29 1.84" />
              </svg>
            </Link>
            <Link
              href="https://github.com"
              className="group"
              aria-label="TaxPal on GitHub"
            >
              <svg
                aria-hidden="true"
                className="h-6 w-6 fill-slate-500 group-hover:fill-slate-700"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </Link>*/}
          </div>
          <p className="mt-6 text-sm text-slate-500 sm:mt-0">Copyright &copy; {new Date().getFullYear()} DoDAO. All rights reserved.</p>
        </div>
        <div className="text-slate-500 flex justify-center font-bold pb-2">
          <p>Crafted with Passion by DoDAO</p>
        </div>
      </Container>
    </footer>
  );
}

export default function DoDAOHome() {
  return (
    <>
      <Head>
        <title>DoDAO</title>
        <meta
          name="description"
          content="Dodao is the ultimate web3 education platform for individuals and businesses, simplifying complex blockchain and decentralized finance concepts to help users succeed in this rapidly evolving industry."
        />
      </Head>
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        <Pricing />
        <Faqs />
      </main>
      <Footer />
    </>
  );
}
