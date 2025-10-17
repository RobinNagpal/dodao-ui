import Link from 'next/link';
import Image from 'next/image';
import { SparklesIcon, ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import studentGif from '@/images/simulations/studentGif.gif';

interface HeroSectionProps {
  onOpenVideo?: () => void;
}

export default function HeroSection({ onOpenVideo }: HeroSectionProps) {
  const stats = [
    { label: 'Business Disciplines', value: '4+' },
    { label: 'Ready-to-Use Cases', value: '10+' },
    { label: 'Student Capacity', value: 'Scalable' },
    { label: 'Setup Time', value: '< 3 min' },
  ];

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900 to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl py-12 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 py-2 text-sm font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30 backdrop-blur-sm">
            <SparklesIcon className="h-4 w-4" />
            The Academic GenAI Simulations Experience
          </div>

          <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-6xl bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            GenAI Simulations for every
            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Business School Stream</span>
          </h1>

          <p className="mt-6 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
            KoalaGains Simulation platform is designed to help students learn how Gen AI and AI Agents can be used in a real-world industry setup. Students
            apply business concepts in Marketing, Finance, HR, and other domains while developing practical AI skills.
          </p>

          <div className="mt-8">
            {/* First row - See Video button (spans width of two buttons) */}
            <div className="flex justify-center mb-4">
              {onOpenVideo && (
                <button
                  onClick={onOpenVideo}
                  className="group inline-flex items-center justify-center rounded-lg border-2 border-indigo-400 bg-indigo-500/20 px-6 py-3 text-base font-semibold text-indigo-300 backdrop-blur-sm hover:bg-indigo-500/30 hover:border-indigo-300 transition-all duration-300 w-full max-w-sm sm:max-w-md"
                >
                  <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  See Demo Video
                </button>
              )}
            </div>

            {/* Second row - Book a Demo and See How It Works buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4 lg:gap-6 max-w-sm sm:max-w-md mx-auto">
              <Link
                href="/#contact"
                className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 w-full sm:flex-1"
              >
                Book a Demo
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-gray-800/50 px-6 py-3 text-base font-semibold text-gray-300 backdrop-blur-sm hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300 w-full sm:flex-1"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8 pb-20">
        <div className="relative rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 backdrop-blur-sm shadow-2xl">
          <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden">
            <Image src={studentGif} alt="Student using GenAI simulation" className="w-full h-full object-cover rounded-xl" unoptimized />
          </div>
        </div>
      </div>
    </section>
  );
}
