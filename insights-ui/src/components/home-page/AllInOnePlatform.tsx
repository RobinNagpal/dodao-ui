import { ArrowPathIcon, CloudArrowUpIcon, Cog6ToothIcon, FingerPrintIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Comprehensive Data Extraction',
    description: 'Our AI tools crawl SEC filings, on-chain data, industry reports, and more—so you always have the full picture.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Multiple Investment Styles',
    description: 'Easily switch between growth, value, dividend, or custom strategies. KoalaGains adapts to your unique investment profile.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Industry & Sector Insights',
    description: 'Compare top players in any sector—REITs, tech, oil & gas, or emerging industries. See historical events and future projections side by side.',
    icon: FingerPrintIcon,
  },
  {
    name: 'Deep Qualitative Analysis',
    description: 'Go beyond numbers. Our AI extracts and summarizes key statements, trends, and developments so you don’t miss a beat.',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Sentiment & Social Listening',
    description: 'Stay in the loop with sentiment trends on Twitter, Instagram, and industry channels—right next to official data.',
    icon: LockClosedIcon,
  },
  {
    name: 'Secure & User-Friendly',
    description: 'Built with security at the forefront. KoalaGains is simple, yet powerful—perfect for individuals and institutions.',
    icon: ServerIcon,
  },
];

export default function AllInOnePlatform() {
  return (
    <div id="features" className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-base/7 font-semibold text-indigo-400">Elevate your investing</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">All-in-One Financial Intelligence</p>
          <p className="mt-6 text-lg/8 text-gray-300">
            Access every tool you need to make well-informed investment decisions—without jumping between multiple websites and cumbersome data sources.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-500" />
                {feature.name}
              </dt>{' '}
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
