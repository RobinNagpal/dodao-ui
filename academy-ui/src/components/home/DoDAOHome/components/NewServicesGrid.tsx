import { CpuChipIcon, CogIcon, BookOpenIcon, WrenchScrewdriverIcon, MagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const services = [
  {
    name: 'AI Agent Development',
    title: 'Custom AI Solutions for Your Business',
    description:
      'End-to-end development of AI agents tailored to your business processes. We build intelligent automation solutions that integrate seamlessly with your existing systems and scale with your growth.',
    icon: CpuChipIcon,
  },
  {
    name: 'Smart Contract Development',
    title: 'Secure Blockchain Solutions',
    description:
      'Expert smart contract development with deep DeFi experience. We build secure, gas-optimized contracts for protocols, DAOs, and decentralized applications, ensuring battle-tested security practices and efficient deployment.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'AI Agent Trainings',
    title: 'Build AI Expertise Within Your Team',
    description:
      'Comprehensive bootcamp programs that empower your team with AI skills. From LLM fundamentals to real-world deployment, master intelligent automation and stay ahead in the AI revolution.',
    icon: BookOpenIcon,
  },
  {
    name: 'DeFi Tooling',
    title: 'Custom Tools for DeFi Protocols',
    description:
      'Build custom DeFi tools, dashboards, and APIs for protocols. From real-time analytics to automated alerts, we create tools that help protocols operate smarter, providing comprehensive insights and data-driven decision making.',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'Research',
    title: 'In-depth Industry Insights',
    description:
      'We provide in-depth research on Real World Assets and emerging technologies, covering regulations, market trends, and investment opportunities. Our insights help companies make informed decisions and stay ahead in rapidly evolving landscapes.',
    icon: MagnifyingGlassIcon,
  },
];

export default function NewServicesGrid() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <p className="mt-2 max-w-lg text-pretty text-4xl font-semibold tracking-tight text-gray-100 sm:text-5xl">Our Services</p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
              <div className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                  <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-sm/4 font-semibold text-indigo-600">{service.name}</h3>
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">{service.title}</p>
                <p className="mt-4 text-sm/6 text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
