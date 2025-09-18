'use client';

import coverImage from '@/images/koala.png';
import Image from 'next/image';
import Link from 'next/link';
import { ChartBarSquareIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import SearchBar from '@/components/core/SearchBar';
import { getScoreColorClasses } from '@/utils/score-utils';

const koalaGainsServices = [
  {
    name: 'KoalaGains Insights',
    description: 'Ready-to-use investment reports: REITs, crowdfunding, tariffs, and more specialized analysis products',
    icon: ChartBarSquareIcon,
    href: '/reports',
    cta: 'Browse Reports',
    color: 'from-emerald-500 to-teal-600',
    highlight: 'Product',
  },
  {
    name: 'KoalaGains Platform',
    description: 'The underlying AI infrastructure powering automated data analysis and report generation',
    icon: RocketLaunchIcon,
    href: '#platform',
    cta: 'Learn More',
    color: 'from-blue-500 to-cyan-600',
    highlight: 'Platform',
  },
];

export function Hero() {
  return (
    <header className="overflow-hidden bg-gray-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate pt-2 lg:pt-2">
          <div className="mx-auto max-w-4xl py-2 sm:py-4 lg:py-8">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <Image src={coverImage} alt="KoalaGains AI-powered platform" fill className="object-contain rounded-xl" priority />
                </div>
              </div>

              {/* Stock Search Section */}
              <div className="mb-12">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    Search Our <span className="text-indigo-400">300+ Stock Analysis Reports</span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">Get instant access to detailed investment analysis for your favorite stocks</p>
                </div>

                <SearchBar placeholder="Search by company name or stock symbol" variant="hero" />
              </div>

              {/* Analysis Categories Section */}
              <div className="mb-24">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Comprehensive <span className="text-indigo-400">Stock Analysis</span> Framework
                  </h2>
                  <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                    Our AI-powered platform analyzes every stock across 6 critical investment dimensions, providing you with investment insights
                  </p>
                </div>

                {/* Analysis Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {[
                    {
                      title: 'Business & Moat',
                      description: 'Competitive advantages, market position, and sustainable business model evaluation',
                      icon: '🏰',
                      color: 'from-blue-500 to-cyan-600',
                    },
                    {
                      title: 'Financial Analysis',
                      description: 'Deep dive into financial statements, ratios, and accounting quality assessment',
                      icon: '📊',
                      color: 'from-green-500 to-emerald-600',
                    },
                    {
                      title: 'Past Performance',
                      description: 'Historical revenue, profitability, and operational efficiency track record',
                      icon: '📈',
                      color: 'from-purple-500 to-violet-600',
                    },
                    {
                      title: 'Future Growth',
                      description: 'Growth prospects, market expansion opportunities, and scalability potential',
                      icon: '🚀',
                      color: 'from-orange-500 to-red-600',
                    },
                    {
                      title: 'Vs Competition',
                      description: 'Comparative analysis against industry peers and market leaders',
                      icon: '⚔️',
                      color: 'from-pink-500 to-rose-600',
                    },
                    {
                      title: 'Fair Value',
                      description: 'Intrinsic value calculation using multiple valuation methodologies',
                      icon: '💰',
                      color: 'from-indigo-500 to-blue-600',
                    },
                  ].map((category, index) => (
                    <div
                      key={category.title}
                      className="bg-gray-700/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-[1.02] group"
                    >
                      <div className="text-center">
                        <div
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${category.color} mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}
                        >
                          {category.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-3">{category.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-xl">🎯</div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Investor Perspective Analysis</h3>
                        <p className="text-gray-300 text-sm">
                          See how legendary investors like Warren Buffett would evaluate each stock using their proven investment strategies
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-xl">⚠️</div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Future Risk Assessment</h3>
                        <p className="text-gray-300 text-sm">
                          Comprehensive risk analysis identifying potential threats and challenges that could impact future performance
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Score System */}
                <div className="text-center bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-8 border border-gray-600/40">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Visual <span className="text-indigo-400">Score System</span>
                    </h3>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                      Each stock receives a comprehensive score out of 25, with visual spider charts showing strengths and weaknesses across all analysis
                      dimensions
                    </p>
                  </div>

                  <div className="flex justify-center items-center space-x-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-500 mb-2">22/25</div>
                      <div className="text-sm text-gray-400">Excellent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-500 mb-2">18/25</div>
                      <div className="text-sm text-gray-400">Good</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-500 mb-2">12/25</div>
                      <div className="text-sm text-gray-400">Fair</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-500 mb-2">5/25</div>
                      <div className="text-sm text-gray-400">Poor</div>
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                AI Solutions for the
                <span className="text-indigo-400"> Future</span>
              </h1>

              <p className="mt-6 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
                KoalaGains: AI-powered investment insights and data reports—crowdfunding, REIT, tariff analysis and more, in minutes.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 max-w-4xl mx-auto mb-12">
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

                      <button
                        onClick={() => {
                          if (service.href.startsWith('#')) {
                            const element = document.querySelector(service.href);
                            if (element) {
                              element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                                inline: 'nearest',
                              });
                            }
                          } else {
                            window.location.href = service.href;
                          }
                        }}
                        className="inline-flex items-center justify-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200 group/link"
                      >
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
                href="/reports"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all duration-200 hover:shadow-lg"
              >
                Explore Our Platform
              </Link>
              <button
                onClick={() => {
                  const element = document.querySelector('#contact');
                  if (element) {
                    element.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                      inline: 'nearest',
                    });
                  }
                }}
                className="inline-flex items-center justify-center rounded-lg border border-indigo-600 bg-transparent px-6 py-3 text-base font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
