import { ChartBarIcon, CircleStackIcon, CurrencyDollarIcon, LightBulbIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/20/solid';

const features = [
  {
    name: 'Create personalized investment reports',
    description:
      'The platform lets you generate detailed analyses for any company, fully tailored to your investment strategy. Whether you’re focused on dividend income or seeking high-growth opportunities, KoalaGains provides the insights you need to make informed decisions.',
    icon: ChartBarIcon,
  },
  {
    name: 'Seamless Data Integration for In-Depth Reporting',
    description:
      'Easily integrate your data sources with our platform to build comprehensive, complex reports. Our platform lets you create workflows that combine different data sources, enabling you to generate in-depth, actionable insights tailored to your needs.',
    icon: UserGroupIcon,
  },
  {
    name: 'Streamline Investment research with KoalaGain',
    description:
      'Instead of going through overwhelming documents and missing key details you can use our platform that extracts the critical information and analyzes it automatically. KoalaGain saves you hours and ensures you never miss essential data when making investment decisions.',
    icon: LockClosedIcon,
  },
];

export default function AllInOnePlatform() {
  return (
    <div id="features" className="bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <p className="text-base/7 font-semibold text-indigo-400">Elevate your investing</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl sm:text-balance">Why use Koalagain?</h2>
            <p className="mt-6 text-lg/8 text-gray-300">
              Access everything you need to make well-informed decisions without jumping between multiple websites and cumbersome data sources.
            </p>
          </div>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-500" />
                {feature.name}
              </dt>{' '}
              <dd className="block mt-1">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
