'use client';

import coverImage from '@/images/koala.png';
import Image from 'next/image';
import Link from 'next/link';
import { CpuChipIcon, AcademicCapIcon, ChartBarSquareIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const koalaGainsServices = [
  {
    name: 'KoalaGains Insights',
    description: 'Ready-to-use investment reports: REITs, crowdfunding, tariffs, and more specialized analysis products',
    icon: ChartBarSquareIcon,
    href: '/reports',
    cta: 'Browse Reports',
    color: 'from-emerald-500 to-teal-600',
    highlight: 'Products',
  },
  {
    name: 'KoalaGains Platform',
    description: 'The underlying AI infrastructure powering automated data analysis, processing, and report generation',
    icon: RocketLaunchIcon,
    href: '#platform',
    cta: 'Learn More',
    color: 'from-blue-500 to-cyan-600',
    highlight: 'Platform',
  },
];

const ourServices = [
  {
    name: 'AI Agent Development',
    description: 'Custom AI Agents tailored to your business needs with advanced automation capabilities',
    icon: CpuChipIcon,
    href: '#agent-development',
    cta: 'Learn More',
    color: 'from-purple-500 to-indigo-600',
    highlight: 'Development',
  },
  {
    name: 'AI Agent Training',
    description: 'Comprehensive training programs to build AI expertise within your organization',
    icon: AcademicCapIcon,
    href: '#agent-training',
    cta: 'Learn More',
    color: 'from-orange-500 to-pink-600',
    highlight: 'Education',
  },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState('koalagains');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab((prev) => (prev === 'koalagains' ? 'services' : 'koalagains'));
        setIsTransitioning(false);
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: string) => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTab(tab);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const currentServices = activeTab === 'koalagains' ? koalaGainsServices : ourServices;

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

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                AI Solutions for the
                <span className="text-indigo-400"> Future</span>
              </h1>

              <p className="mt-6 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
                KoalaGains: AI-powered investment insights and data reports—crowdfunding, REIT, tariff analysis and more, in minutes. We also specialize in
                custom AI Agent development and training to help businesses harness the power of artificial intelligence.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-xl p-1 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50">
                <button
                  onClick={() => handleTabClick('koalagains')}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === 'koalagains'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  KoalaGains
                </button>
                <button
                  onClick={() => handleTabClick('services')}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                    activeTab === 'services' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  Our Services
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 max-w-4xl mx-auto mb-12">
              {currentServices.map((service, index) => (
                <div
                  key={service.name}
                  className={`relative group transition-all duration-500 z-10 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
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
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
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
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/25"
              >
                Explore Our Platform
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-600 bg-transparent px-6 py-3 text-base font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
