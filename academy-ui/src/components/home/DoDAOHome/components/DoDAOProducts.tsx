import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';
import KoalaGains from '@/images/DoDAOHomePage/koala_gains.gif';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { ArrowTopRightOnSquareIcon, PlayIcon } from '@heroicons/react/24/outline';

type Product = {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  categoryColor: string;
  bgGradient: string;
};

const products: Product[] = [
  {
    id: 'koala-gains',
    name: 'KoalaGains',
    tagline: 'AI-Powered Investment Insights',
    problem: 'Investment research takes weeks and often misses critical insights across multiple data sources',
    solution: 'AI Agents analyze crowdfunding projects, REITs, and public companies in minutes with detailed financial insights and reports',
    description:
      'KoalaGains revolutionizes investment research through powerful AI-driven insights, enabling users to quickly analyze investment opportunities with unprecedented speed and accuracy.',
    features: ['Automated Financial Reports', 'Interactive Spider Charts', 'Sentiment-Driven Analysis', 'AI-Powered Scoring'],
    imageSrc: KoalaGains.src,
    imageAlt: 'KoalaGains AI Investment Platform',
    ctaText: 'Try KoalaGains',
    ctaLink: 'https://koalagains.com/',
    category: 'AI Agent',
    categoryColor: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  {
    id: 'tidbits-hub',
    name: 'Tidbits Hub',
    tagline: 'Micro-Learning Made Simple',
    problem: "Complex topics overwhelm users with lengthy content that's hard to digest and retain",
    solution: 'Bite-sized learning content delivers key insights in under 5 minutes with interactive elements',
    description:
      'Tidbits Hub transforms complex information into digestible 5-10 minute learning experiences with step-by-step tidbits, videos, and clickable demos',
    features: ['Step-by-Step Tidbits', 'One-Minute Videos', 'Clickable Demos', 'Interactive Quizzes'],
    imageSrc: TidbitsHubGif.src,
    imageAlt: 'Tidbits Hub Learning Platform',
    ctaText: 'Explore Tidbits',
    ctaLink: 'https://tidbitshub.org/',
    category: 'Education',
    categoryColor: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50',
  },
  {
    id: 'defi-alerts',
    name: 'DeFi Alerts',
    tagline: 'Real-Time DeFi Intelligence',
    problem: 'DeFi users miss profitable opportunities and risk liquidation due to lack of real-time monitoring',
    solution: 'Proactive alerts for yields, position health, and market changes across all chains and protocols',
    description:
      'DeFi Alerts provides real-time notifications for DeFi opportunities and risks, helping users optimize yields and manage positions efficiently across multiple protocols.',
    features: ['Multi-Chain Monitoring', 'Custom Alert Thresholds', 'Position Health Tracking', 'Yield Optimization'],
    imageSrc: DefiGif.src,
    imageAlt: 'DeFi Alerts Platform',
    ctaText: 'Get Alerts',
    ctaLink: 'https://www.defialerts.xyz/',
    category: 'DeFi Tool',
    categoryColor: 'from-green-500 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50',
  },
  {
    id: 'academy-sites',
    name: 'Academy Sites',
    tagline: 'Comprehensive Learning Ecosystems',
    problem: 'Organizations struggle to create engaging, comprehensive training that accommodates different learning styles and tracks progress effectively',
    solution: 'Multi-format learning platform with courses, guides, tidbits, and interactive clickable demos tailored to your organization',
    description:
      'Academy Sites provides a complete learning ecosystem with nano-courses, interactive demos, and comprehensive training guides tailored to your organization.',
    features: ['Nano-Courses (5-10 mins)', 'Clickable Demos', 'Full Course Guides', 'Progress Tracking'],
    imageSrc: AcademyGif.src,
    imageAlt: 'Academy Sites Learning Platform',
    ctaText: 'Build Academy',
    ctaLink: '/home-section/dodao-io/products/academy-sites',
    category: 'Education',
    categoryColor: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-50 to-blue-50',
  },
];

export default function DoDAOProducts() {
  return (
    <section className="py-16 sm:py-20" id="products">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Products That <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Solve Real Problems</span>
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-600">
            From AI-powered investment insights to comprehensive learning platforms, our products transform how businesses operate and users learn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${product.categoryColor}`}></div>

              <div className="p-6">
                <div className="flex flex-wrap items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mr-3">{product.name}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${product.categoryColor}`}>
                    {product.category}
                  </div>
                </div>

                <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">{product.tagline}</p>

                <p className="text-gray-600 text-sm mb-6">{product.description}</p>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${product.categoryColor}`}></div>
                        <span className="text-gray-700 text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="relative p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                      </div>
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">Challenge</h4>
                    </div>
                    <p className="text-gray-700 text-xs">{product.problem}</p>
                  </div>

                  <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1 bg-green-100 rounded-lg">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-xs font-bold text-green-800 uppercase tracking-wide">Solution</h4>
                    </div>
                    <p className="text-gray-700 text-xs font-medium">{product.solution}</p>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden mb-4">
                  <img src={product.imageSrc || '/placeholder.svg'} alt={product.imageAlt} className="w-full h-48 object-cover object-center" />
                </div>

                <div className="text-center">
                  <a
                    href={product.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-5 py-2 rounded-xl bg-gradient-to-r ${product.categoryColor} text-white font-medium text-sm`}
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    {product.ctaText}
                    <ArrowTopRightOnSquareIcon className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
