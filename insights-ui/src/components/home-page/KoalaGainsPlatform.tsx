import { ChartBarSquareIcon, DocumentChartBarIcon, LightBulbIcon, WrenchIcon, CpuChipIcon, CircleStackIcon, ShieldCheckIcon } from '@heroicons/react/20/solid';
import architectureImage from '@/images/architecture.png';
import platformImage from '@/images/homepage/platform-img.jpg';
import Image from 'next/image';

const keyFeatures = [
  {
    name: 'Automated Reports',
    description:
      'Generate comprehensive reports using AI-driven automation that provides in-depth analysis of balance sheets, income statements, and cash flow statements.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Spider Chart for Financial Metrics',
    description: 'Quickly view key financial parameters at a glance with an interactive chart that simplifies complex data for easy interpretation.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'AI Scoring and Explanation',
    description: 'Our AI agent rates the company based on its performance and then justifies the rating by quoting relevant information.',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Sentiment-Driven Insights',
    description: 'Extract valuable market sentiment from news, social media (X & Instagram), and industry discussions.',
    icon: LightBulbIcon,
  },
  {
    name: 'SEC Filings & Data Extraction',
    description: 'AI-powered tools process EDGAR filings, extracting both quantitative and qualitative insights for regulatory compliance and decision-making.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Advanced AI for Speed & Accuracy',
    description:
      'KoalaGains uses top-tier AI models to make the process up to 50x faster. Generate detailed, sector-specific investment reports in minutes instead of hours or days.',
    icon: WrenchIcon,
  },
];

const platformBenefits = [
  {
    name: 'Complete AI-Powered Solution',
    description:
      'Design and deploy custom AI Agents tailored to your exact investment strategy—market risk scoring, dividend screening, ESG analysis, or growth forecasting. From finance to healthcare, KoalaGains adapts to any industry with personalized AI-driven reports that match your strategy perfectly.',
    icon: CpuChipIcon,
  },
  {
    name: 'Unified Data & Cross-Domain Flexibility',
    description:
      'Connect all your data sources—APIs, SEC filings, spreadsheets, databases, even PDFs—into one seamless workflow. KoalaGains handles data ingestion, normalization, aggregation, and visualization across any industry, letting you focus purely on insights and decision-making.',
    icon: CircleStackIcon,
  },
  {
    name: 'Ultra-Low Cost & Automated Intelligence',
    description:
      'Generate high-quality, data-rich reports with charts, references, and stats in minutes at a fraction (1/100) of traditional research costs. Let KoalaGains automatically extract insights from earnings calls, filings, and market news while you scale up or down without admin overhead.',
    icon: ShieldCheckIcon,
  },
];

export default function KoalaGainsPlatform() {
  return (
    <div className="bg-gray-800">
      <div className="py-4 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">KoalaGains Platform</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl sm:text-balance">Key Features</p>
            <p className="mt-4 text-lg text-gray-300">
              Unlock the full potential of your investment research with our advanced AI-driven platform that delivers insights in minutes, not days.
            </p>
          </div>
          <dl className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
            {keyFeatures.map((feature) => (
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

      <div className="overflow-hidden py-8 sm:py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <p className="text-base/7 font-semibold text-indigo-400">Automate Your Reporting Workflow</p>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Why Choose KoalaGains?</h2>
                <p className="mt-4 text-lg text-gray-300">
                  KoalaGains brings together data ingestion, AI-driven analysis, and rich visualization in one platform. Configure once and let your custom AI
                  Agents generate consistent, high-fidelity reports on demand.
                </p>
                <dl className="mt-8 max-w-xl space-y-8 text-base/7 text-gray-300 lg:max-w-none">
                  {platformBenefits.map((feature) => (
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
              alt="KoalaGains AI platform dashboard"
              className="w-[48rem] h-full max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0 opacity-60"
            />
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base/7 font-semibold text-indigo-400">KoalaGains Platform</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl sm:text-balance">Product Architecture</p>
            <p className="mt-4 text-lg text-gray-300">
              Our system automatically extracts, analyzes, and delivers customized financial insights, providing you with everything you need, hassle-free.
            </p>
          </div>
        </div>
        <div className="relative overflow-hidden pt-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              src={architectureImage}
              alt="KoalaGains Platform architecture diagram showing layered AI-driven analysis flow"
              priority
              className="rounded-xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
