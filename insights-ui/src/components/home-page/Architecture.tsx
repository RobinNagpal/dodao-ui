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
    name: 'Automated Financial Reports .',
    description: 'Generate comprehensive balance sheets, income statements, and cash flow reports with AI-driven automation.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Spider Chart for Financial Metrics',
    description: 'Visualize key financial parameters in an interactive chart, making complex data easier to interpret.',
    icon: BugAntIcon,
  },
  {
    name: 'Market & Competitor Analysis.',
    description: 'Compare industry performance, identify growth opportunities, and benchmark against competitors.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Sentiment-Driven Insights.',
    description: ' Extract valuable market sentiment from news, social media (X & Instagram), and industry discussions.',
    icon: LightBulbIcon,
  },
  {
    name: 'SEC Filings & Data Extraction.',
    description: 'AI-powered tools process EDGAR filings, extracting both quantitative and qualitative insights for regulatory compliance and decision-making.',
    icon: DocumentCurrencyDollarIcon,
  },
  {
    name: 'Custom AI Reports.',
    description: ' Tailor investment-specific reports based on growth strategies, market trends, and business needs.',
    icon: WrenchIcon,
  },
];

export default function Architecture() {
  return (
    <div className="bg-gray-800 py-16 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-400">Everything you need</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl sm:text-balance">
            AI-Powered Financial Insights, No Hassle
          </p>
          <p className="mt-6 text-lg/8 text-gray-300">
            Stay ahead with automated financial reports and market insights. Our AI-driven system extracts, analyzes, and delivers customized reports tailored
            to your business needs.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Image src={architectureImage} alt="" priority />
          <div aria-hidden="true" className="relative">
            <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-gray-900 pt-[7%]" />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-white">
                <feature.icon aria-hidden="true" className="absolute top-1 left-1 h-5 w-5 text-indigo-500" />
                {feature.name}
              </dt>{' '}
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
