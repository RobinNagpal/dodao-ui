'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, PlayIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import KoalaGains from '@/images/DoDAOHomePage/koala_gains.gif';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';

const products = [
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const nextProduct = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevProduct = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToProduct = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextProduct();
    }, 15000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentProduct = products[currentIndex];

  return (
    <section className="py-12 sm:py-16" id="products">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-6">
        <div className="mx-auto max-w-3xl text-center mb-8">
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Products That <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Solve Real Problems</span>
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-600">
            From AI-powered investment insights to comprehensive learning platforms, our products transform how businesses operate and users learn.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200 shadow-lg">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => goToProduct(index)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  index === currentIndex
                    ? `bg-gradient-to-r ${product.categoryColor} text-white shadow-md`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {product.name}
                {index === currentIndex && <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"></div>}
              </button>
            ))}
          </div>
        </div>

        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <button
            onClick={prevProduct}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border border-gray-200"
            aria-label="Previous product"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={nextProduct}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group border border-gray-200"
            aria-label="Next product"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>

          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">
              <div className={`absolute inset-0 bg-gradient-to-br ${currentProduct.bgGradient} opacity-30`}></div>

              <div className="relative p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{currentProduct.name}</h3>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white w-fit bg-gradient-to-r ${currentProduct.categoryColor} shadow-md`}
                      >
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        {currentProduct.category}
                      </div>
                    </div>
                    <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      {currentProduct.tagline}
                    </p>
                    <p className="text-gray-600 leading-relaxed">{currentProduct.description}</p>
                  </div>

                  <div className={`transition-all duration-500 delay-100 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                    <div className="space-y-6">
                      <div className="text-right">
                        <a
                          href={currentProduct.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r ${currentProduct.categoryColor} text-white font-bold text-base hover:shadow-lg transition-all duration-300 hover:scale-105 group`}
                        >
                          <PlayIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                          {currentProduct.ctaText}
                          <ArrowTopRightOnSquareIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Key Features</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {currentProduct.features.slice(0, 4).map((feature, index) => (
                            <div
                              key={feature}
                              className="group flex items-center space-x-2 p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-100 hover:bg-white/80 hover:border-gray-200 transition-all duration-200"
                            >
                              <div
                                className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentProduct.categoryColor} group-hover:shadow-sm transition-all duration-200`}
                              ></div>
                              <span className="text-gray-700 text-sm font-medium group-hover:text-gray-900 transition-colors duration-200">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className={`transition-all duration-500 delay-200 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 h-full overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                      <div className="relative">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                          </div>
                          <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide">Challenge</h4>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{currentProduct.problem}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`transition-all duration-500 delay-300 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 h-full overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                      <div className="relative">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="text-sm font-bold text-green-800 uppercase tracking-wide">Solution</h4>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed font-medium">{currentProduct.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`transition-all duration-500 delay-400 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200">
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Live Demo
                    </span>
                  </div>

                  <div className="relative max-w-5xl mx-auto">
                    <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm border border-white/50">
                      <img src={currentProduct.imageSrc || '/placeholder.svg'} alt={currentProduct.imageAlt} className="w-full h-auto object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <PlayIcon className="w-8 h-8 text-gray-700 ml-1" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-full opacity-30 animate-pulse delay-1000"></div>
                    <div className="absolute top-1/4 -left-3 w-3 h-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full opacity-25 animate-pulse delay-500"></div>
                    <div className="absolute top-3/4 -right-3 w-4 h-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-20 animate-pulse delay-700"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
