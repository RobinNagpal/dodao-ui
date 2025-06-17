import { CodeBracketIcon, WrenchScrewdriverIcon, PresentationChartLineIcon, ShieldCheckIcon, CpuChipIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';
import { Container } from './Container';

const blockchain = [
  {
    name: 'Smart Contract Development',
    description:
      'Expert smart contract development with deep DeFi experience. We build secure, gas-optimized contracts for protocols, DAOs, and decentralized applications. Our team has contributed to leading DeFi protocols, ensuring battle-tested security practices and efficient deployment.',
    href: '#',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Custom DeFi Tooling',
    description:
      'Build custom DeFi tools, dashboards, and APIs for protocols. From real-time analytics to automated alerts, we create tools that help protocols operate smarter. Our DeFi tooling has been trusted by top protocols, providing comprehensive insights and data-driven decision making capabilities.',
    href: '#',
    icon: WrenchScrewdriverIcon,
  },
];

const aiagent = [
  {
    name: 'Custom AI Agent Development',
    description:
      'At DoDAO, we offer AI Agent development services using advanced tools tailored to your business needs. Our trusted and highly trained AI Agents streamline financial processes and enhance decision-making, empowering your business with smarter solutions. If you’re looking for a customized AI Agent to meet your unique requirements, DoDAO is here to assist you.',
    href: '#',
    icon: CpuChipIcon,
  },
  {
    name: 'Maintenance and Support',
    description:
      'We provide ongoing maintenance and support to ensure your AI Agents operate seamlessly and deliver consistent performance. With DoDAO, you can rely on a partner committed to the long-term success of your AI-powered systems. Our maintenance services are designed to keep your AI Agents running smoothly and efficiently, helping you achieve your business goals.',
    href: '#',
    icon: LifebuoyIcon,
  },
];

export default function Services() {
  return (
    <section className="sm:pb-20" id="services">
      <Container size="lg" className="bg-gray-50 pt-8">
        <SectionHeading number="2" id="services-title">
          Development Services
        </SectionHeading>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <p className="text-base font-semibold leading-7 text-indigo-600">Everything you need</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">AI Agent Services</h2>
            <p className="mt-4 text-base text-gray-500">
              At DoDAO, we provide AI Agent services designed to empower your business with intelligent solutions, streamline operations, and drive smarter
              decision-making.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl pb-8">
          <dl className="flex flex-wrap justify-center gap-y-10">
            {aiagent.map((value, index) => (
              <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === aiagent.length - 1 ? 'sm:mx-auto' : ''}`}>
                <dt className="text-base font-semibold text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {value.name}
                </dt>
                <dd className="mt-2 text-gray-500 text-base">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">DeFi Services</h2>
            <p className="mt-4 text-base text-gray-500">
              At DoDAO, we offer specialized DeFi development services designed to help you build secure, scalable solutions in the decentralized finance space.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl pb-8">
          <dl className="flex flex-wrap justify-center gap-y-10">
            {blockchain.map((value, index) => (
              <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === blockchain.length - 1 ? 'sm:mx-auto' : ''}`}>
                <dt className="text-base font-semibold text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {value.name}
                </dt>
                <dd className="mt-2 text-gray-500 text-base">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
