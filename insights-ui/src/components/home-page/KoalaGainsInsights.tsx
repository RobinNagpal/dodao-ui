import { ChartBarIcon, CircleStackIcon, LightBulbIcon } from '@heroicons/react/20/solid';

const insights = [
  {
    name: 'REIT Reports',
    description:
      'Comprehensive REIT analysis covering debt & leverage, rental health, operations & expense management, and shareholder value alignment. Features spider charts and detailed financial metrics.',
    icon: ChartBarIcon,
  },
  {
    name: 'Crowdfunding Reports',
    description:
      'In-depth startup evaluation across founder assessment, traction analysis, market opportunity, execution speed, valuation review, and financial health with AI-powered scoring.',
    icon: CircleStackIcon,
  },
  {
    name: 'Tariff Reports',
    description:
      'Industry-specific tariff impact analysis covering upstream, midstream, and downstream effects on supply chains, competitive landscapes, and investment opportunities.',
    icon: LightBulbIcon,
  },
];

export default function KoalaGainsInsights() {
  return (
    <div className="bg-gray-800 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
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
              <dd className="block mt-1">{insight.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
