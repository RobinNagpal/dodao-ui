import {
  ArrowPathIcon,
  BugAntIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  DocumentCurrencyDollarIcon,
  LightBulbIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid';
import architectureImage from '@/images/architecture.png';
import Image from 'next/image';

const features = [
  {
    name: 'Automated Reports. ',
    description:
      'Generate comprehensive reports using AI-driven automation that provides in-depth analysis of balance sheets, income statements, and cash flow statements.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Spider Chart for Financial Metrics. ',
    description: 'Quickly view key financial parameters at a glance with an interactive chart that simplifies complex data for easy interpretation.',
    icon: BugAntIcon,
  },
  {
    name: 'AI Scoring and Explanation. ',
    description: 'Our AI agent rates the company based on its performance and then justifies the rating by quoting relevant information.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Sentiment-Driven Insights. ',
    description: ' Extract valuable market sentiment from news, social media (X & Instagram), and industry discussions.',
    icon: LightBulbIcon,
  },
  {
    name: 'SEC Filings & Data Extraction. ',
    description: 'AI-powered tools process EDGAR filings, extracting both quantitative and qualitative insights for regulatory compliance and decision-making.',
    icon: DocumentCurrencyDollarIcon,
  },
  {
    name: 'Advanced AI for Speed & Accuracy. ',
    description:
      'KoalaGains uses top-tier AI models to make the process up to 50x faster. Generate detailed, sector-specific investment reports in minutes instead of hours or days.',
    icon: WrenchIcon,
  },
];

export default function Architecture() {
  return (
    <div className="bg-gray-800 py-16 sm:py-16">
      <div className="mx-auto max-w-2xl sm:text-center">
        <h2 className="text-base/7 font-semibold text-indigo-400">Accelerate Your Insights</h2>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl sm:text-balance">Key Features of KoalaGains</p>
        <p className="mt-6 text-lg/8 text-gray-300">Unlock the full potential of your investment research with our advanced AI-driven features.</p>
      </div>
      <div className="mx-auto mb-16 max-w-7xl px-6 sm:mt-20 md:mt-16 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
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
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Discover Our AI Powered Research Framework</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl sm:text-balance">Product Architecture</p>
          <p className="mt-6 text-lg/8 text-gray-300">
            Our system automatically extracts, analyzes, and delivers customized financial insights, providing you with everything you need, hassle-free.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Image src={architectureImage} alt="Architecture diagram showing KoalaGains’ layered AI-driven analysis flow" priority />
          <div aria-hidden="true" className="relative">
            <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-gray-900 pt-[7%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
