import { CurrencyDollarIcon, ChartBarIcon, DocumentTextIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const services = [
  {
    name: 'Crowdfunding',
    description: 'Explore startup investment opportunities with AI-powered analysis and risk assessment.',
    href: '/crowd-funding',
    icon: CurrencyDollarIcon,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Stock Analysis',
    description: 'Comprehensive stock reports with deep value insights across global markets.',
    href: '/stocks',
    icon: ChartBarIcon,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Tariff Reports',
    description: 'Industry-specific tariff impact analysis and trade policy insights.',
    href: '/tariff-reports',
    icon: DocumentTextIcon,
    color: 'from-indigo-500 to-violet-600',
  },
  {
    name: 'Daily Top Gainers',
    description: 'Track the best performing stocks of the day across US markets.',
    href: '/daily-top-movers/top-gainers/country/US',
    icon: ArrowTrendingUpIcon,
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Daily Top Losers',
    description: 'Monitor market downturns and identify potential recovery opportunities.',
    href: '/daily-top-movers/top-losers/country/US',
    icon: ArrowTrendingDownIcon,
    color: 'from-red-500 to-rose-600',
  },
  {
    name: 'Professional Managers',
    description: 'Discover top portfolio managers and their investment strategies.',
    href: '/portfolio-managers/professional-managers',
    icon: UserGroupIcon,
    color: 'from-purple-500 to-indigo-600',
  },
];

export default function ServiceNavigation() {
  return (
    <section className="bg-gray-800 pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Explore Our <span className="text-indigo-400">Insights</span>
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
            Access comprehensive investment insights, market analysis, and professional tools to make informed decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {services.map((service) => (
            <Link key={service.name} href={service.href} className="group relative transition-all duration-500 z-10">
              <div className="bg-gray-700/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] hover:bg-gray-700/60 relative overflow-hidden">
                <div className="flex items-center mb-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-4 group-hover:text-indigo-400 transition-colors">{service.name}</h3>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">{service.description}</p>

                <div className="flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span className="text-sm font-medium">Explore</span>
                  <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16 sm:mt-20 border-b border-gray-600"></div>
    </section>
  );
}
