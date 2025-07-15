import { CpuChipIcon, CogIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { SectionHeading } from './SectionHeading';

const tariffFeatures = [
  {
    name: 'Industry Scope & Structure',
    description:
      'Comprehensive analysis of industry value chains from upstream feedstock production to downstream fabrication & distribution, including key players and market dynamics.',
    icon: CpuChipIcon,
  },
  {
    name: 'Tariff Dynamics & Impacts',
    description:
      'Detailed examination of how tariff changes reshape trade flows, import costs, and domestic utilization rates across different industry segments.',
    icon: CogIcon,
  },
  {
    name: 'Strategic Investment Insights',
    description:
      'Strategic overview of segment dynamics, competitive positioning, and trade intersections shaping industry resilience and investment opportunities.',
    icon: RocketLaunchIcon,
  },
];

export default function Tariff() {
  return (
    <section id="tariff" className="bg-gray-800 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="mb-6">
            <SectionHeading number="3">Tariff</SectionHeading>
          </div>
          <h2 className="text-4xl font-semibold text-indigo-400">Tariff Analysis</h2>
          <p className="mt-4 text-lg text-gray-300">
            Comprehensive industry-specific tariff impact analysis covering established players, emerging challengers, and potential investment opportunities
            created by changing trade policies across different sectors.
          </p>
        </div>
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {tariffFeatures.map((feature) => (
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
            href="/tariff-reports"
            className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
          >
            View Tariff Reports
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
