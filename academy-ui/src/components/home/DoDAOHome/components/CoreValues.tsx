'use client';

import { LightBulbIcon, WrenchIcon, ArrowTrendingUpIcon, RocketLaunchIcon, AcademicCapIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Image from 'next/image';
import aiAgent from '@/images/DoDAOHomePage/aiAgent.webp';
import defiImage from '@/images/DoDAOHomePage/defi.jpeg';

const aiValues = [
  {
    name: 'AI Agent Design & Development',
    description:
      'We specialize in designing and developing AI Agents that go beyond simple automation. Our Agents are context-aware, goal-driven, and built for complex real-world tasks—from investment research to internal business operations.',
    icon: LightBulbIcon,
  },
  {
    name: 'Real-World Agent Deployment',
    description:
      'We actively deploy AI Agents in real environments, train them with domain-specific knowledge, and ensure they generate value across industries like finance, real estate, and education.',
    icon: RocketLaunchIcon,
  },
  {
    name: 'AI Agent Training',
    description:
      'We train students and professionals to build production-ready AI Agents. Our bootcamps teach real-world workflows—covering prompt engineering, memory use, and building Agents for finance, real estate, and education.',
    icon: AcademicCapIcon,
  },
];

const defiValues = [
  {
    name: 'DeFi Tooling & Dashboards',
    description:
      'We build tools, dashboards, and APIs for leading DeFi protocols. Whether custom analytics, real-time alerts, or on-chain data visualization, our work helps protocols operate smarter.',
    icon: WrenchIcon,
  },
  {
    name: 'Smart Contracts & Protocol Design',
    description:
      'With deep experience in protocol development, we contribute to DeFi ecosystems through secure smart contracts, DAO tooling, and product education—accelerating adoption across Web3.',
    icon: ArrowTrendingUpIcon,
  },
];

export default function CoreValues() {
  const [openAiItem, setOpenAiItem] = useState<number | null>(null);
  const [openDefiItem, setOpenDefiItem] = useState<number | null>(null);

  const toggleAiItem = (index: number) => {
    setOpenAiItem(openAiItem === index ? null : index);
  };

  const toggleDefiItem = (index: number) => {
    setOpenDefiItem(openDefiItem === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-20">
          <h2 className="text-base font-semibold leading-7 text-blue-400 mb-4">What We Do</h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <span className="block">AI Agents & DeFi Tools</span>
          </p>
          <p className="mt-6 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
            From building intelligent AI workflows to creating DeFi tools, we build products that ship and teach others how to do the same.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-1">
              <div className="relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm">
                <Image src={aiAgent} alt="AI Agent Development" width={600} height={320} className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 backdrop-blur-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AI Agents
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Intelligent AI Agent Solutions</h3>
              <p className="text-gray-300 text-base">We build AI agents that think, learn, and act autonomously to solve real-world business challenges.</p>
            </div>

            <div className="space-y-3">
              {aiValues.map((value, index) => (
                <div key={value.name} className="group relative">
                  <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <button onClick={() => toggleAiItem(index)} className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                          <value.icon aria-hidden="true" className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">{value.name}</h4>
                      </div>
                      <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${openAiItem === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openAiItem === index && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-300 text-sm leading-relaxed pl-11">{value.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 lg:order-1">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Modern DeFi Solutions</h3>
              <p className="text-gray-300 text-base">We create tools and protocols that power the next generation of decentralized finance.</p>
            </div>

            <div className="space-y-3">
              {defiValues.map((value, index) => (
                <div key={value.name} className="group relative">
                  <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <button onClick={() => toggleDefiItem(index)} className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-600">
                          <value.icon aria-hidden="true" className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">{value.name}</h4>
                      </div>
                      <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${openDefiItem === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openDefiItem === index && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-300 text-sm leading-relaxed pl-11">{value.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:order-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 p-1">
              <div className="relative overflow-hidden rounded-xl bg-gray-900/50 backdrop-blur-sm">
                <Image src={defiImage} alt="DeFi Development" width={600} height={320} className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-indigo-300 backdrop-blur-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    DeFi Tools
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
