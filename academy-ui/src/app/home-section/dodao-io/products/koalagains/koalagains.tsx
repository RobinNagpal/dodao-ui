'use client';
import {
  ArrowPathRoundedSquareIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import ContactModal from '../../../../../components/home/DoDAOHome/components/ContactModal';
import Chatbot from '@/images/DoDAOHomePage/koala_gains.gif';
import { useState } from 'react';

const benefits = [
  {
    name: 'Better Investment Choices',
    href: '#',
    description: 'KoalaGains uses smart AI Agents to study data and show you clear facts, helping you invest wisely and see where the best chances are.',
    icon: ScaleIcon,
  },
  {
    name: 'Less Risk',
    href: '#',
    description: 'Our platform offers detailed reports on key investment factors, helping you make informed choices and avoid risky decisions.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Complete Analysis',
    href: '#',
    description: 'KoalaGains looks at everything that matters—like company performance and finances—to give you a full view of each project.',
    icon: ClipboardDocumentCheckIcon,
  },
];

const features = [
  {
    name: 'All-in-One Reports',
    description:
      'KoalaGains collects key details such as cash flow, debts, and market standing. It then creates reports that show you the big picture of a project.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Risk Checks',
    description: 'Our system tags the good and bad aspects, so you can quickly see strengths and weaknesses of any crowdfunded or REIT project.',
    icon: ShieldExclamationIcon,
  },
  {
    name: 'Team Performance',
    description: 'KoalaGains looks at the team’s background and past work, giving you insights into their ability to grow and handle challenges.',
    icon: UserGroupIcon,
  },
  {
    name: 'Up-to-Date Information',
    description: 'We bring in the latest sec filings data, so you always have the most current view of any investment.',
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    name: 'AI-Powered Insights',
    description: 'Our AI Agents processes large amounts of data and sums it up in easy-to-read summaries that fit your specific needs.',
    icon: CpuChipIcon,
  },
];

const incentives = [
  {
    name: 'Goal and Objectives',
    description:
      'KoalaGains aims to help you handle crowdfunded projects and REITs by using smart AI. Many of these investments can be risky if you don’t have full information. We decided to solve this problem by building a platform that shows clear, simple data.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/1270/1270380.png',
  },
  {
    name: 'The Solution',
    description:
      'Our AI studies each project’s filings, market signals, and team details. Then it turns that data into easy-to-understand reports. By showing strong points, risks, and potential growth, KoalaGains helps you invest with more confidence and clarity.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/8787/8787168.png',
  },
];

function KoalaGainsComponent() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div>
      <div>
        {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
        <div className="relative overflow-hidden bg-white">
          <div aria-hidden="true" className="hidden lg:absolute lg:inset-0 lg:block">
            <svg fill="none" width={640} height={784} viewBox="0 0 640 784" className="absolute left-1/2 top-0 -translate-y-8 translate-x-64 transform">
              <defs>
                <pattern x={118} y={0} id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047" width={20} height={20} patternUnits="userSpaceOnUse">
                  <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
                </pattern>
              </defs>
              <rect y={72} fill="currentColor" width={640} height={640} className="text-gray-50" />
              <rect x={118} fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" width={404} height={784} />
            </svg>
          </div>

          <div className="relative pb-4 sm:pb-12 lg:pb-20">
            <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-24">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
                  <h1>
                    <span className="mt-1 block text-4xl font-bold tracking-tight sm:text-6xl">
                      <span className="block text-indigo-600">KoalaGains</span>
                    </span>
                  </h1>
                  <p className="mt-3 text-lg leading-8 text-gray-500">
                    KoalaGains is an AI-powered platform that simplifies investment research on crowdfunding projects and REITs. It shows important details,
                    checks risks, and helps you see both the strengths and weaknesses parts of every opportunity.
                  </p>
                  <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <a
                        onClick={() => setShowContactModal(true)}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white cursor-pointer hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg"
                      >
                        Get started
                      </a>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
                      <a
                        href="https://koalagains.com/"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:px-10 md:py-4 md:text-lg"
                      >
                        Live demo
                      </a>
                    </div>
                  </div>
                </div>
                <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                  <svg
                    fill="none"
                    width={640}
                    height={784}
                    viewBox="0 0 640 784"
                    aria-hidden="true"
                    className="absolute left-1/2 top-0 origin-top -translate-x-1/2 -translate-y-8 scale-75 transform sm:scale-100 lg:hidden"
                  >
                    <defs>
                      <pattern x={118} y={0} id="4f4f415c-a0e9-44c2-9601-6ded5a34a13e" width={20} height={20} patternUnits="userSpaceOnUse">
                        <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
                      </pattern>
                    </defs>
                    <rect y={72} fill="currentColor" width={640} height={640} className="text-gray-50" />
                    <rect x={118} fill="url(#4f4f415c-a0e9-44c2-9601-6ded5a34a13e)" width={404} height={784} />
                  </svg>
                  <div className="relative mx-auto w-full rounded-lg shadow-lg">
                    <button
                      type="button"
                      className="relative block w-full overflow-hidden rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Picture for ai Chatbot</span>
                      <img alt="Picture for ai Chatbot" src={Chatbot.src} className="w-full" />
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-20 lg:px-4 mt-12">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 px-4 lg:max-w-none lg:grid-cols-2">
            {incentives.map((incentive) => (
              <div key={incentive.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
                <div className="sm:shrink-0">
                  <div className="flow-root">
                    <img alt="" src={incentive.imageSrc} className="mx-auto h-24 w-28" />
                  </div>
                </div>
                <div className="mt-3 sm:ml-3 sm:mt-0 lg:ml-0 lg:mt-3">
                  <h3 className="text-lg font-semibold text-gray-900">{incentive.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{incentive.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative bg-white py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Features of KoalaGains</h2>
          <p className="mx-auto mt-5 max-w-prose text-base text-gray-500">
            Each feature is made to help you quickly understand key points about any crowdfunded project or REIT. It saves you time and reduces uncertainty.
          </p>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center rounded-xl bg-indigo-500 p-3 shadow-lg">
                          <feature.icon aria-hidden="true" className="h-6 w-6 text-white" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg/8 font-semibold tracking-tight text-gray-900">{feature.name}</h3>
                      <p className="mt-5 text-base/7 text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="relative bg-gray-800 pb-32">
          <div className="absolute inset-0">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&&sat=-100"
              className="size-full object-cover h-80"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gray-800 mix-blend-multiply" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Why KoalaGains Helps You</h1>
            <p className="mt-6 max-w-3xl text-base text-gray-300">
              KoalaGains sifts through large sets of data for you. It uncovers essential details, shows you clear visuals, and helps you take quick and smart
              steps without guesswork.
            </p>
          </div>
        </div>
        <section aria-labelledby="contact-heading" className="relative z-10 mx-auto -mt-32 max-w-7xl px-6 pb-32 lg:px-8">
          <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {benefits.map((link) => (
              <div key={link.name} className="flex flex-col rounded-2xl bg-white shadow-xl">
                <div className="relative flex-1 px-6 pb-8 pt-16 md:px-8">
                  <div className="absolute top-0 inline-block -translate-y-1/2 transform rounded-xl bg-indigo-600 p-5 shadow-lg">
                    <link.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
                  <p className="mt-4 text-base text-gray-500">{link.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default KoalaGainsComponent;
