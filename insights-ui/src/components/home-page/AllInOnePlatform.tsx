import { ChartBarIcon, CircleStackIcon, LightBulbIcon } from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Personalized AI-Driven Reports',
    description:
      'Configure custom AI Agents in KoalaGains to generate investment reports that perfectly match your strategy—whether that’s dividend screening, growth forecasting, or ESG scoring.',
    icon: ChartBarIcon,
  },
  {
    name: 'Unified Data Pipeline',
    description:
      'Connect all your data sources—APIs, spreadsheets, databases, even PDFs—into one workflow. KoalaGains handles ingestion, normalization, and storage so you can focus on insights.',
    icon: CircleStackIcon,
  },
  {
    name: 'Automated Insight Extraction',
    description:
      'Let KoalaGains sift through earnings calls, filings, market news, and custom datasets to surface the metrics and narratives that matter most to your decisions.',
    icon: LightBulbIcon,
  },
];

export default function AllInOnePlatform() {
  return (
    <div id="features" className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <p className="text-base/7 font-semibold text-indigo-400">Elevate Your Analysis</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Why Choose KoalaGains?</h2>
          <p className="mt-6 text-lg/8 text-gray-300">
            All your reporting needs—data ingestion, AI-powered analysis, and charting—live in one place. Save time, cut costs, and never miss a critical data
            point.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-500" />
                {feature.name}
              </dt>
              <dd className="block mt-1">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
