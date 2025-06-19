import { ChartBarIcon, CircleStackIcon, LightBulbIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { SectionHeading } from './SectionHeading';

const insights = [
  {
    name: 'REIT Reports',
    description:
      'Comprehensive REIT analysis covering debt & leverage, rental health, operations & expense management, and shareholder value alignment. Features spider charts and detailed financial metrics.',
    icon: ChartBarIcon,
    href: '/public-equities/tickers',
  },
  {
    name: 'Crowdfunding Reports',
    description:
      'In-depth startup evaluation across founder assessment, traction analysis, market opportunity, execution speed, valuation review, and financial health with AI-powered scoring.',
    icon: CircleStackIcon,
    href: '/crowd-funding',
  },
  {
    name: 'Tariff Reports',
    description:
      'Industry-specific tariff impact analysis covering upstream, midstream, and downstream effects on supply chains, competitive landscapes, and investment opportunities.',
    icon: LightBulbIcon,
    href: '/tariff-reports',
  },
];

export default function KoalaGainsInsights() {
  return (
    <section id="insights" className="bg-gray-800 pt-16 sm:pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="mb-6">
            <SectionHeading number="2">Insights</SectionHeading>
          </div>
          <h2 className="text-4xl font-semibold text-indigo-400">KoalaGains Insights</h2>
          <p className="mt-4 text-lg text-gray-300">
            Access comprehensive, AI-generated investment analysis across multiple asset classes. Our reports deliver deep insights with charts, metrics, and
            actionable intelligence in minutes.
          </p>
        </div>
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {insights.map((insight) => (
            <div key={insight.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <insight.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-500" />
                {insight.name}
              </dt>
              <dd className="block mt-1 mb-4">{insight.description}</dd>
              <div className="mt-3">
                <Link
                  href={insight.href}
                  className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200 group"
                >
                  See Reports
                  <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-16 sm:mt-20 border-b border-gray-600"></div>
    </section>
  );
}
