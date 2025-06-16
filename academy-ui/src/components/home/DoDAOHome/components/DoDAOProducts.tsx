'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, PlayIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import KoalaGains from '@/images/DoDAOHomePage/koala_gains_reduced.gif';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';

const products = [
  {
    id: 'koala-gains',
    name: 'KoalaGains',
    tagline: 'AI-Powered Investment Intelligence',
    problem: 'Investment research takes weeks and often misses critical insights across multiple data sources',
    solution: 'AI agents analyze crowdfunding projects, REITs, and public companies in minutes with comprehensive reports',
    description:
      'KoalaGains revolutionizes investment research through powerful AI-driven insights, enabling users to quickly analyze investment opportunities with unprecedented speed and accuracy.',
    features: [
      'Automated Financial Reports',
      'Interactive Spider Charts',
      'Sentiment-Driven Analysis',
      'AI-Powered Scoring',
      'Multi-Asset Coverage',
      'Real-time Data Integration',
    ],
    metrics: [
      { label: 'Analysis Time', value: '5 mins', subtext: 'vs 2-3 weeks manual' },
      { label: 'Data Sources', value: '50+', subtext: 'integrated platforms' },
      { label: 'Accuracy Rate', value: '94%', subtext: 'prediction accuracy' },
    ],
    imageSrc: KoalaGains.src,
    imageAlt: 'KoalaGains AI Investment Platform',
    ctaText: 'Try KoalaGains',
    ctaLink: '/home-section/dodao-io/products/koalagains',
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
      'Tidbits Hub transforms complex information into digestible 5-10 minute learning experiences with videos, interactive demos, and shareable content.',
    features: ['5-10 Minute Learning Bites', 'One-Minute Videos', 'Interactive Demos', 'Social Media Ready', 'Embedded CTAs', 'Progress Tracking'],
    metrics: [
      { label: 'Learning Time', value: '5 mins', subtext: 'per topic' },
      { label: 'Retention Rate', value: '85%', subtext: 'vs 20% traditional' },
      { label: 'Completion Rate', value: '92%', subtext: 'user engagement' },
    ],
    imageSrc: TidbitsHubGif.src,
    imageAlt: 'Tidbits Hub Learning Platform',
    ctaText: 'Explore Tidbits',
    ctaLink: '/home-section/dodao-io/products/tidbitshub',
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
    features: ['Multi-Chain Monitoring', 'Custom Alert Thresholds', 'Position Health Tracking', 'Yield Optimization', 'Risk Management', 'API Integration'],
    metrics: [
      { label: 'Response Time', value: '<60s', subtext: 'alert delivery' },
      { label: 'Protocols', value: '100+', subtext: 'supported' },
      { label: 'Uptime', value: '99.9%', subtext: 'reliability' },
    ],
    imageSrc: '/placeholder.svg?height=400&width=600',
    imageAlt: 'DeFi Alerts Platform',
    ctaText: 'Get Alerts',
    ctaLink: '/home-section/dodao-io/products/defialerts',
    category: 'DeFi Tool',
    categoryColor: 'from-green-500 to-teal-500',
    bgGradient: 'from-green-50 to-teal-50',
  },
  {
    id: 'academy-sites',
    name: 'Academy Sites',
    tagline: 'Comprehensive Learning Ecosystems',
    problem: 'Organizations struggle to create engaging, comprehensive training that accommodates different learning styles and tracks progress effectively',
    solution: 'Multi-format learning platform with courses, simulations, and interactive content tailored to your organization',
    description:
      'Academy Sites provides a complete learning ecosystem with nano-courses, interactive simulations, and comprehensive training programs tailored to your organization.',
    features: ['Nano-Courses (5-10 mins)', 'Interactive Simulations', 'Full Course Programs', 'Progress Tracking', 'Custom Branding', 'Multi-Format Content'],
    metrics: [
      { label: 'Course Length', value: '5-10 mins', subtext: 'nano-courses' },
      { label: 'Engagement', value: '88%', subtext: 'completion rate' },
      { label: 'Custom Sites', value: '50+', subtext: 'organizations served' },
    ],
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

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextProduct();
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentProduct = products[currentIndex];

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden" id="products">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <Container size="lg" className="relative">
        <SectionHeading number="1" id="products-title">
          Products
        </SectionHeading>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Products That{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Solve Real Problems</span>
            </h2>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              From AI-powered investment research to comprehensive learning platforms, our products transform how businesses operate and users learn.
            </p>
          </div>

          {/* Product Showcase */}
          <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {/* Navigation Arrows */}
            <button
              onClick={prevProduct}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group border border-gray-200"
              aria-label="Previous product"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
            </button>

            <button
              onClick={nextProduct}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group border border-gray-200"
              aria-label="Next product"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* Main Product Card */}
            <div className="mx-auto max-w-7xl">
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100">
                <div className={`absolute inset-0 bg-gradient-to-br ${currentProduct.bgGradient} opacity-30`}></div>

                {/* Vertical Layout */}
                <div className="relative">
                  {/* Content Section */}
                  <div className="p-8 lg:p-12">
                    {/* Category Badge */}
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white mb-8 w-fit bg-gradient-to-r ${currentProduct.categoryColor} shadow-lg`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      {currentProduct.category}
                    </div>

                    {/* Product Name & Tagline */}
                    <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                      <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">{currentProduct.name}</h3>
                      <p className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                        {currentProduct.tagline}
                      </p>
                    </div>

                    {/* Problem & Solution Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                      {/* Problem */}
                      <div className={`transition-all duration-500 delay-100 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-red-50 border border-red-100 h-full">
                          <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-2">The Problem</h4>
                            <p className="text-gray-700 text-base leading-relaxed">{currentProduct.problem}</p>
                          </div>
                        </div>
                      </div>

                      {/* Solution */}
                      <div className={`transition-all duration-500 delay-200 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                        <div className="flex items-start space-x-4 p-6 rounded-2xl bg-green-50 border border-green-100 h-full">
                          <div className="flex-shrink-0">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-2">Our Solution</h4>
                            <p className="text-gray-700 text-base leading-relaxed font-medium">{currentProduct.solution}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className={`text-center mb-8 transition-all duration-500 delay-300 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
                      <a
                        href={currentProduct.ctaLink}
                        className={`inline-flex items-center px-8 py-4 rounded-2xl bg-gradient-to-r ${currentProduct.categoryColor} text-white font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}
                      >
                        <PlayIcon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                        {currentProduct.ctaText}
                        <ArrowTopRightOnSquareIcon className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    </div>
                  </div>

                  {/* GIF Demo Section - Full Width */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                    <div className={`transition-all duration-500 delay-400 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      {/* Demo Label */}
                      <div className="text-center mb-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200">
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Live Demo
                        </span>
                      </div>
                      
                      {/* GIF Container */}
                      <div className="relative max-w-5xl mx-auto">
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/50">
                          <img 
                            src={currentProduct.imageSrc || '/placeholder.svg'} 
                            alt={currentProduct.imageAlt} 
                            className="w-full h-auto object-contain"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
                          
                          {/* Play overlay effect */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <PlayIcon className="w-8 h-8 text-gray-700 ml-1" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Floating Elements around GIF */}
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-full opacity-30 animate-pulse delay-1000"></div>
                        <div className="absolute top-1/4 -left-6 w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full opacity-25 animate-pulse delay-500"></div>
                        <div className="absolute top-3/4 -right-6 w-5 h-5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full opacity-20 animate-pulse delay-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className={`mt-12 transition-all duration-500 delay-500 ${isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
              <div className="text-center mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Key Features</h4>
                <p className="text-gray-600">Everything you need to get started</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {currentProduct.features.map((feature, index) => (
                  <div
                    key={feature}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentProduct.categoryColor}`}></div>
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center mt-12 space-x-4">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToProduct(index)}
                  className={`relative transition-all duration-300 ${index === currentIndex ? 'scale-125' : 'hover:scale-110'}`}
                  aria-label={`Go to product ${index + 1}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                  ></div>
                  {index === currentIndex && <div className="absolute inset-0 w-4 h-4 rounded-full bg-blue-600 animate-ping opacity-30"></div>}
                </button>
              ))}
            </div>

            {/* Product Counter */}
            <div className="text-center mt-6">
              <span className="text-sm text-gray-500 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                {currentIndex + 1} of {products.length} Products
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
