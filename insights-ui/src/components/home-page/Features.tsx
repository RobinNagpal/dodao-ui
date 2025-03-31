import platformImage from '@/images/homepage/platform-img.jpg';
import { ChartBarSquareIcon, HomeIcon, ShieldCheckIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

const features = [
  {
    name: 'Sector-Specific Analysis',
    description:
      'Different industries get evaluated on different metrics as each industry has different requirements. Our platform focuses on industry specific factors like rent and debt for REITs or product pipelines for tech, ensuring your analysis is finely tuned to market specifics.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Multiple Investment Styles',
    description:
      ' Investors can get investment analysis reports tailored to their investment strategies. An investor who wants to invest in companies that offer regular dividends, he can use our platform to generate reports about those companies. ',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Unlocking Mid-to-Small Cap Opportunities',
    description:
      'Previously overlooked due to high research costs, mid-to-small companies now receive the detailed analysis they deserve. Our automated approach delivers comprehensive insights at a fraction of the cost, enabling you to confidently tap into potentially lucrative opportunities.',
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
              <p className="text-base/7 font-semibold text-indigo-400">Revolutionized Investment analysis with AI</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Unique Features of KoalaGains</h2>
              <p className="mt-6 text-lg/8 text-gray-300">
                Our platform automatically collects, organizes and presents data in intuitive reports. This smart platform adapts to your personal investment
                style making your analysis faster and more efficient.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="block mt-1">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <Image
            src={platformImage}
            alt="Finance graph"
            // width={2432}
            // height={1442}
            className="w-[48rem] h-full max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0 opacity-60"
          ></Image>
        </div>
      </div>
    </div>
  );
}
