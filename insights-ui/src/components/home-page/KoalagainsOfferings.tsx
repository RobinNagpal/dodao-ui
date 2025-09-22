import { ChartBarSquareIcon, ChartPieIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const koalaGainsServices = [
  {
    name: 'KoalaGains Insights',
    description: 'Ready-to-use investment reports - stocks, crowdfunding, tariffs, and other sectors.',
    icon: ChartBarSquareIcon,
    href: '/reports',
    cta: 'Browse Reports',
    color: 'from-emerald-500 to-teal-600',
    highlight: 'Product',
  },
  {
    name: 'KoalaGains Platform',
    description: 'AI infrastructure that powers automated data analysis and on-demand report generation.',
    icon: RocketLaunchIcon,
    href: '#platform',
    cta: 'Learn More',
    color: 'from-blue-500 to-cyan-600',
    highlight: 'Platform',
  },
  {
    name: 'KoalaGains Simulations',
    description: 'Hands-on simulations showing how Gen AI and AI agents operate in realistic industry scenarios.',
    icon: ChartPieIcon,
    href: '#platform',
    cta: 'Learn More',
    color: 'from-indigo-300 to-violet-500', // subtle, neutral gradient
    highlight: 'Platform',
  },
];

export default function KoalagainsOfferings() {
  return (
    <section className="overflow-hidden bg-gray-800">
      <div>
        <div className=" w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 relative isolate pt-2 lg:pt-2">
          <div className="bg-gray-800 pt-12 sm:pt-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                AI Solutions for the
                <span className="text-indigo-400"> Future</span>
              </h1>
            </div>
            <p className="mt-6 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
              KoalaGains: AI-powered investment insights and data reports—crowdfunding, REIT, tariff analysis and more, in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mx-auto">
            {koalaGainsServices.map((service, index) => (
              <div key={service.name} className="relative group transition-all duration-500 z-10">
                <div className="flex justify-center mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${service.color} text-white shadow-lg`}
                  >
                    {service.highlight}
                  </span>
                </div>

                <div className="bg-gray-700/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] hover:bg-gray-700/60 relative overflow-hidden">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${service.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-3">{service.name}</h3>

                    <p className="text-gray-300 text-sm mb-6 leading-relaxed min-h-[3rem]">{service.description}</p>

                    <button className="inline-flex items-center justify-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200 group/link">
                      {service.cta}
                      <svg className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4-293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative z-20">
            <Link
              href="/stocks"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all duration-200 hover:shadow-lg"
            >
              Explore Our Platform
            </Link>
            <Link
              href="mailto:robinnagpal@koalagains.com"
              className="inline-flex items-center justify-center rounded-lg border border-indigo-600 bg-transparent px-6 py-3 text-base font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 backdrop-blur-sm"
            >
              Get In Touch
            </Link>
          </div>
        </div>
        <div className="mt-16 sm:mt-20 border-b border-gray-600"></div>
      </div>
    </section>
  );
}
