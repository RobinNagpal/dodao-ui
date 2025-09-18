import { CpuChipIcon, CogIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { SectionHeading } from './SectionHeading';

const crowdfundingFeatures = [
  {
    name: 'Startup Evaluation',
    description: 'Comprehensive analysis of startup potential including founder assessment, business model validation, and market opportunity evaluation.',
    icon: CpuChipIcon,
  },
  {
    name: 'Risk Assessment',
    description: 'Advanced risk scoring covering financial health, execution capability, competitive landscape, and regulatory compliance factors.',
    icon: CogIcon,
  },
  {
    name: 'Investment Scoring',
    description: 'AI-powered scoring system that evaluates traction metrics, valuation reasonableness, and long-term growth potential.',
    icon: RocketLaunchIcon,
  },
];

export default function Crowdfunding() {
  return (
    <section id="crowdfunding" className="bg-gray-800 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="mb-6">
            <SectionHeading number="2">Crowdfunding</SectionHeading>
          </div>
          <h2 className="text-4xl font-semibold text-indigo-400">Crowdfunding Analysis</h2>
          <p className="mt-4 text-lg text-gray-300">
            In-depth startup evaluation across founder assessment, traction analysis, market opportunity, execution speed, valuation review, and financial
            health with AI-powered scoring.
          </p>
        </div>
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {crowdfundingFeatures.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-500" />
                {feature.name}
              </dt>
              <dd className="block mt-1">{feature.description}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 text-center">
          <Link
            href="/crowd-funding"
            className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
          >
            View Crowdfunding Reports
            <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
      <div className="mt-16 sm:mt-20 border-b border-gray-600"></div>
    </section>
  );
}
