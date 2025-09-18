import { CpuChipIcon, CogIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { SectionHeading } from './SectionHeading';

const reitFeatures = [
  {
    name: 'Financial Health Analysis',
    description: 'Comprehensive analysis of debt & leverage ratios, cash flow stability, and balance sheet strength to assess REIT financial performance.',
    icon: CpuChipIcon,
  },
  {
    name: 'Property Portfolio Assessment',
    description: 'Detailed evaluation of rental health, occupancy rates, geographic diversification, and property type distribution across the portfolio.',
    icon: CogIcon,
  },
  {
    name: 'Shareholder Value Metrics',
    description: 'Analysis of dividend sustainability, FFO growth trends, and management efficiency in creating long-term shareholder value.',
    icon: RocketLaunchIcon,
  },
];

export default function REIT() {
  return (
    <section id="reit" className="bg-gray-800 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="mb-6">
            <SectionHeading number="3">REIT</SectionHeading>
          </div>
          <h2 className="text-4xl font-semibold text-indigo-400">REIT Analysis</h2>
          <p className="mt-4 text-lg text-gray-300">
            Comprehensive REIT analysis covering debt & leverage, rental health, operations & expense management, and shareholder value alignment. Features
            spider charts and detailed financial metrics.
          </p>
        </div>
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {reitFeatures.map((feature) => (
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
            href="/stocks/industry/REITS"
            className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
          >
            View REIT Reports
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
