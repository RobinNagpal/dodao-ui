import { CodeBracketIcon, WrenchScrewdriverIcon, PresentationChartLineIcon, ShieldCheckIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { SectionHeading } from './SectionHeading';
import { Container } from './Container';

const features = [
  {
    name: 'Blockchain Tooling',
    description:
      'DoDAO’s blockchain tooling has been trusted by top protocols in the industry. Our tools are designed to simplify blockchain operations and enhance your development process. If you’re looking to brainstorm new tooling ideas or need expert assistance with your existing tools, DoDAO is here to help, offering support and innovation tailored to your needs.',
    href: '#',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'DeFi Analytics',
    description:
      'We offer advanced DeFi analytics services, helping you create detailed dashboards to track and analyze your on-chain activity. Our Asset Analysis Dashboard is one of the most comprehensive in the market, providing deep insights and real-time data. It’s trusted by some of the leading DeFi protocols, helping them make data-driven decisions.',
    href: '#',
    icon: PresentationChartLineIcon,
  },
  {
    name: 'AI/LLM Development and Solution',
    description:
      'DoDAO also offers AI and Large Language Model (LLM) development and solutions. Our team can help you integrate cutting-edge AI technologies into your systems, providing custom solutions that leverage the power of machine learning and natural language processing to enhance automation, decision-making, and user experiences in your business.',
    href: '#',
    icon: CpuChipIcon,
  },
  {
    name: 'Blockchain Development',
    description:
      'At DoDAO, we specialize in blockchain development with a strong focus on Decentralized Finance (DeFi). Our team of experts has contributed to the top DeFi protocols, ensuring secure and scalable solutions that drive the future of decentralized finance. Whether you’re building smart contracts, decentralized applications, or any other blockchain project, we have the expertise to help you succeed.',
    href: '#',
    icon: CodeBracketIcon,
  },
  {
    name: 'DeFi Risk Analysis',
    description:
      'At DoDAO, we offer expert on-chain risk analysis using advanced models. Monte Carlo simulations help forecast risks, while multivariate GARCH models capture dynamic relationships between assets to manage volatility. We ensure accuracy by evaluating models with Akaike Information Criterion (AIC), Bayesian Information Criterion (BIC), and Mean Squared Error (MSE).',
    href: '#',
    icon: ShieldCheckIcon,
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
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Development Services</p>
            <p className="mt-4 text-base text-gray-500">
              At DoDAO, we offer a suite of specialized development services designed to help you innovate and stay ahead in the blockchain landscape.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl pb-8">
          <dl className="flex flex-wrap justify-center gap-y-10">
            {features.map((value, index) => (
              <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === features.length - 1 ? 'sm:mx-auto' : ''}`}>
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
