import platformImage from '@/images/homepage/platform-img.jpg';
import { ChartBarSquareIcon, HomeIcon, ShieldCheckIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

const features = [
  {
    name: 'Accurate SEC Summaries',
    description: 'We parse 10-K, 10-Q, 8-K, and more to deliver both quantitative and qualitative insights, giving you crucial detail at every step.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Sector-Specific Analysis',
    description:
      'Different metrics matter to different industries. KoalaGains highlights key factors—like rent and debt for REITs or product pipelines for tech.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Smart Evaluations',
    description:
      'Our platform simplifies data of companies, pulling out growth trajectories, rent details in case of REITs, and relevant events so you can see the bigger picture.',
    icon: HomeIcon,
  },
];

export default function Features() {
  return (
    <div className="overflow-hidden bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-400">A Better Workflow</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Powered by Purpose-Built AI</p>
              <p className="mt-6 text-lg/8 text-gray-300">
                KoalaGains leverages custom AI agents that consolidate data into user-friendly reports, timelines, and comparisons. Easily configure these
                agents for your unique investment style.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <Image
            src={platformImage}
            alt={'finance graph'}
            width={2432}
            height={1442}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0 opacity-60"
          ></Image>
        </div>
      </div>
    </div>
  );
}
