import { StarRating } from '@/components/home-page/StarRating';
import coverImage from '@/images/koala.png';
import Image from 'next/image';
import Link from 'next/link';
import { CpuChipIcon, AcademicCapIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';

const services = [
  {
    name: 'AI Agent Development',
    description: 'Custom AI agents tailored to your business needs with advanced automation capabilities.',
    icon: CpuChipIcon,
    href: '#contact',
    cta: 'Get Started',
    color: 'from-blue-500 to-indigo-600',
    highlight: 'Specialization',
  },
  {
    name: 'AI Agent Training',
    description: 'Comprehensive training programs to build AI expertise within your organization.',
    icon: AcademicCapIcon,
    href: '#contact',
    cta: 'Learn More',
    color: 'from-purple-500 to-pink-600',
    highlight: 'Education',
  },
  {
    name: 'KoalaGains Platform',
    description: 'AI-powered investment analysis platform for detailed financial insights and reports.',
    icon: ChartBarSquareIcon,
    href: '/reports',
    cta: 'See Examples',
    color: 'from-emerald-500 to-teal-600',
    highlight: 'Platform',
  },
];

function Testimonial() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <div className="flex justify-center text-indigo-400 lg:justify-start">
        <StarRating />
      </div>
      <blockquote className="mt-2">
        <p className="font-display text-lg font-medium text-white">
          "It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change."
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-gray-400">
        <strong className="font-semibold text-indigo-400 before:content-['—_']">Charles Darwin</strong>
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <header className="overflow-hidden bg-gray-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate pt-4 lg:pt-8">
          {/* Main Hero Content */}
          <div className="mx-auto max-w-4xl py-16 sm:py-20 lg:py-24">
            {/* Hero Header with Koala */}
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

              <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
                From custom AI agent development to comprehensive training programs and powerful investment analysis tools - we deliver cutting-edge AI Agent
                solutions that transform how businesses operate and make decisions.
              </p>
            </div>

            {/* Three Main Services */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="relative bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50 hover:border-indigo-500/50 transition-colors duration-300"
                >
                  <div className="absolute -top-3 left-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${service.color} text-white shadow-lg`}
                    >
                      {service.highlight}
                    </span>
                  </div>
                  {/* <div className={`flex items-center justify-center w-12 h-12 ${service.color} rounded-lg mb-4`}>
                    <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div> */}

                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3">{service.name}</h3>

                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{service.description}</p>

                  <Link
                    href={service.href}
                    className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    {service.cta}
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            {/* Main CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reports"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200"
              >
                Explore Our Platform
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-600 bg-transparent px-6 py-3 text-base font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors duration-200"
              >
                Get In Touch
              </a>
            </div>
          </div>

          {/* Testimonial */}
          <div className="flex justify-center">
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 max-w-2xl">
              <Testimonial />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
