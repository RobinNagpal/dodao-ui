import { CpuChipIcon, CogIcon, RocketLaunchIcon } from '@heroicons/react/20/solid';

const developmentFeatures = [
  {
    name: 'Custom AI Agent Solutions',
    description:
      'End-to-end development of AI agents tailored to your business processes, from automated data analysis and customer service to complex decision-making systems.',
    icon: CpuChipIcon,
  },
  {
    name: 'Advanced Automation',
    description:
      'Sophisticated automation capabilities that integrate seamlessly with your existing systems, streamlining workflows and reducing manual intervention across operations.',
    icon: CogIcon,
  },
  {
    name: 'Scalable Architecture',
    description:
      'Enterprise-grade AI solutions built for scale, with robust architecture that grows with your business needs and handles increasing complexity over time.',
    icon: RocketLaunchIcon,
  },
];

export default function AIAgentDevelopment() {
  return (
    <div className="bg-gray-800 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <p className="text-base/7 font-semibold text-indigo-400">AI Agent Development</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Custom AI Solutions for Your Business</h2>
          <p className="mt-4 text-lg text-gray-300">
            Custom AI agent development tailored to your unique business needs. We build intelligent automation solutions that integrate seamlessly with your
            existing systems and scale with your growth.
          </p>
        </div>
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
          {developmentFeatures.map((feature) => (
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
