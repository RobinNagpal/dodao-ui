import { ChartBarSquareIcon, DocumentChartBarIcon, LightBulbIcon, WrenchIcon } from '@heroicons/react/20/solid';
import architectureImage from '@/images/architecture.png';
import Image from 'next/image';
import { SectionHeading } from './SectionHeading';

const keyFeatures = [
  {
    name: 'Automated Reports.',
    description:
      'Generate comprehensive reports using AI-driven automation that provides in-depth analysis of balance sheets, income statements, and cash flow statements.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Spider Chart for Financial Metrics.',
    description: 'Quickly view key financial parameters at a glance with an interactive chart that simplifies complex data for easy interpretation.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'AI Scoring and Explanation.',
    description: 'Our AI agent rates the company based on its performance and then justifies the rating by quoting relevant information.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Sentiment-Driven Insights.',
    description: 'Extract valuable market sentiment from news, social media (X & Instagram), and industry discussions.',
    icon: LightBulbIcon,
  },
  {
    name: 'SEC Filings & Data Extraction.',
    description: 'AI-powered tools process EDGAR filings, extracting both quantitative and qualitative insights for regulatory compliance and decision-making.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Advanced AI for Speed & Accuracy.',
    description:
      'KoalaGains uses top-tier AI models to make the process up to 50x faster. Generate detailed, sector-specific investment reports in minutes instead of hours or days.',
    icon: WrenchIcon,
  },
];

export default function KoalaGainsPlatform() {
  return (
    <section id="platform" className="bg-gray-800 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="mb-6">
            <SectionHeading number="1">Platform</SectionHeading>
          </div>
          <h2 className="text-4xl font-semibold text-indigo-400">KoalaGains Platform</h2>
          <p className="mt-4 text-lg text-gray-300">
            Unlock the full potential of your investment research with our advanced AI-driven platform that delivers insights in minutes, not days.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Image
            src={architectureImage}
            alt="KoalaGains Platform architecture diagram showing layered AI-driven analysis flow"
            priority
            className=" rounded-xl shadow-2xl ring-1 ring-white/10"
          />
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-12 md:mt-16 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {keyFeatures.map((feature) => (
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
    </section>
  );
}
