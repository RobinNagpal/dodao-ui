import { LightBulbIcon, UserGroupIcon, WrenchIcon, ArrowTrendingUpIcon, RocketLaunchIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const coreValues = [
  {
    name: 'AI Agent Design & Development',
    description:
      'We specialize in designing and developing AI Agents that go beyond simple automation. Our agents are context-aware, goal-driven, and built for complex real-world tasks—from investment research to internal business operations.',
    icon: LightBulbIcon,
  },
  {
    name: 'Real-World Agent Deployment',
    description:
      'It’s not just about building. We actively deploy AI Agents in real environments, train them with domain-specific knowledge, and ensure they generate value across industries like finance, real estate, and education.',
    icon: RocketLaunchIcon,
  },
  {
    name: 'AI Agent Training',
    description:
      'We train students and professionals to build production-ready AI Agents. Our bootcamps teach real-world workflows—covering prompt engineering, memory use, and building agents for finance, real estate, and education.',
    icon: AcademicCapIcon,
  },
  {
    name: 'DeFi Tooling & Dashboards',
    description:
      'We’ve built tools, dashboards, and APIs for leading DeFi protocols. Whether it’s custom analytics, real-time alerts, or on-chain data visualization, our work helps protocols operate smarter.',
    icon: WrenchIcon,
  },
  {
    name: 'Smart Contracts & Protocol Design',
    description:
      'With deep experience in protocol development, we’ve contributed to DeFi ecosystems through secure smart contracts, DAO tooling, and product education—accelerating adoption across Web3.',
    icon: ArrowTrendingUpIcon,
  },
];

export default function CoreValues() {
  return (
    <div className="py-8 bg-gray-50">
      <div className="mx-auto px-6 w-full">
        <div className="mx-auto max-w-2xl text-center lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">What We Do</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">AI Agents & DeFi Tools</p>
          <p className="mt-4 text-base text-gray-500">
            From building intelligent AI workflows to creating DeFi tools, we build products that ship—and teach others how to do the same.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-6xl">
          <dl className="flex flex-wrap justify-center gap-y-10">
            {coreValues.map((value, index) => (
              <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === coreValues.length - 1 ? 'sm:mx-auto' : ''}`}>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {value.name}
                </dt>
                <dd className="mt-2 text-base text-gray-500">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
