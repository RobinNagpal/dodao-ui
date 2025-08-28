'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  PresentationChartLineIcon,
  PhotoIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import CanvaViewModal from '@/components/ui/CanvaViewModal';

interface GenAIUseCase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  canvaUrl: string;
  canvaEmbedUrl: string;
  blogLinks: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  keyFeatures: string[];
  realWorldExample: {
    company: string;
    challenge: string;
    solution: string;
    impact: string;
    caseStudyUrl?: string;
  } | null;
  gradient: string;
}

const genaiUseCases: GenAIUseCase[] = [
  {
    id: 'data-analytics',
    title: 'GenAI in Data Analytics',
    subtitle: 'Real-time insights using natural language',
    description:
      'Transform how teams interact with data by enabling anyone to ask questions in plain English and get instant charts, tables, and insights. No technical expertise required.',
    icon: ChartBarIcon,
    canvaUrl: 'https://www.canva.com/design/DAGsCNteLME/QUJ-8PwItLmfBXP-Emy0bw/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGsCNteLME/QUJ-8PwItLmfBXP-Emy0bw/view?embed',
    blogLinks: [
      {
        title: 'GenAI Data Analytics Capabilities',
        url: 'https://koalagains.com/blogs/2025-07-09-generative-ai-data-analytics-capabilities',
        description: 'How GenAI is transforming data and analytics workflows',
      },
      {
        title: 'Tools & Services for GenAI Analytics',
        url: 'https://koalagains.com/blogs/genai-analytics-tools-services',
        description: 'Leading tools enabling GenAI-driven analytics capabilities',
      },
      {
        title: 'Comparison of GenAI Analytics Platforms',
        url: 'https://koalagains.com/blogs/compare-genai-analytics-platforms',
        description: 'Compare AWS QuickSight, Google Looker, Power BI, Qlik Sense & ThoughtSpot',
      },
    ],
    keyFeatures: [
      'Natural language to SQL query generation',
      'Automated chart and visualization creation',
      'Real-time narrative report generation',
      'Embedded conversational analytics',
    ],
    realWorldExample: {
      company: 'GoDaddy',
      challenge: 'Business analysts needed 3–4 weeks to prepare dashboards due to manual processes.',
      solution: 'Adopted Amazon QuickSight and Q for natural language queries and unified data sources.',
      impact: 'Reduced data preparation from 1+ week to 4 days, exploration to under 10 minutes.',
      caseStudyUrl: 'https://aws.amazon.com/blogs/business-intelligence/interac-empowers-financial-analysts-with-generative-ai-and-amazon-quicksight/',
    },
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'customer-support',
    title: 'GenAI in Customer Support',
    subtitle: 'Intelligent, personalized customer experiences',
    description:
      'Revolutionize customer service with AI that understands context, provides instant answers, and guides users through complex processes with human-like interaction.',
    icon: UserGroupIcon,
    canvaUrl: 'https://www.canva.com/design/DAGsIZKvEWA/wEbRPjbFX9kJ6-9ycSsxMQ/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGsIZKvEWA/wEbRPjbFX9kJ6-9ycSsxMQ/view?embed',
    blogLinks: [],
    keyFeatures: [
      'AI-powered Q&A with instant accurate responses',
      'Visual issue recognition and guidance',
      'Proactive issue detection and alerts',
      'Multi-language support and real-time translation',
    ],
    realWorldExample: {
      company: 'ING Bank',
      challenge: 'Handling 85,000+ weekly customer queries, especially outside working hours, stretched support capacity',
      solution: 'Launched a GenAI-powered chat agent to answer common questions instantly, without waiting for human agents',
      impact: 'Enabled 24/7 support, serving 20% more customers in just 7 weeks while improving satisfaction and compliance',
      caseStudyUrl:
        'https://www.mckinsey.com/industries/financial-services/how-we-help-clients/banking-on-innovation-how-ing-uses-generative-ai-to-put-people-first',
    },
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'personalization',
    title: 'GenAI in Personalization',
    subtitle: 'Hyper-personalized customer experiences',
    description:
      'Enable true one-to-one personalization across all touchpoints, from customized product recommendations to personalized content that resonates with each individual customer.',
    icon: SparklesIcon,
    canvaUrl: 'https://www.canva.com/design/DAGsNPZrpRc/uWi-zDJHrRy0Zc_LT8593Q/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGsNPZrpRc/uWi-zDJHrRy0Zc_LT8593Q/view?embed',
    blogLinks: [],
    keyFeatures: [
      'Dynamic content generation based on user behavior',
      'Real-time personalization across all channels',
      'Predictive preferences and recommendations',
      'Contextual and adaptive user interfaces',
    ],
    realWorldExample: {
      company: 'Duolingo',
      challenge: 'Generic lessons didn’t adapt to individual learner skill levels',
      solution:
        'Launched Duolingo Max with GPT-4 roleplay, letting learners practice conversations with Duolingo characters where difficulty adapts to their skill level',
      impact: 'Boosted user engagement and paying subscribers surged 62% year over year after GPT-4 integration',
      caseStudyUrl: 'https://investors.duolingo.com/news-releases/news-release-details/duolingo-reports-62-dau-growth-42-revenue-growth-and-increased',
    },
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'education',
    title: 'GenAI in Education',
    subtitle: 'Personalized learning at scale',
    description:
      "Transform education with AI tutors that adapt to each student's learning style, provide instant feedback, and create personalized content that ensures no one falls behind.",
    icon: AcademicCapIcon,
    canvaUrl: 'https://www.canva.com/design/DAGs4DN-2js/hFTI7Iul5NWcrPVmqZjwjg/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGs4DN-2js/hFTI7Iul5NWcrPVmqZjwjg/view?embed',
    blogLinks: [],
    keyFeatures: [
      'Instant lesson and rubric generation',
      'Automated, specific feedback on assignments',
      'Personalized learning paths for each student',
      'Step-by-step explanations for complex problems',
    ],
    realWorldExample: {
      company: 'Edexia',
      challenge: 'Teachers spend countless hours grading by hand, leading to delays, inconsistent feedback, and less time for students',
      solution:
        'Built an education-tuned GenAI system that auto-grades assignments, generates personalized comments, learns from corrections, and highlights student struggles through analytics',
      impact: 'Frees up teacher time, delivers faster and fairer feedback, and helps identify learning gaps earlier',
      caseStudyUrl: 'https://www.edexia.com/',
    },
    gradient: 'from-purple-500 to-pink-500',
  },

  {
    id: 'presentations',
    title: 'GenAI in Presentations',
    subtitle: 'AI-powered deck creation in minutes',
    description:
      'Transform presentation creation from hours of manual work to minutes of AI-assisted generation. Create polished, on-brand presentations with automated content, design, and formatting.',
    icon: PresentationChartLineIcon,
    canvaUrl: 'https://www.canva.com/design/DAGtKCRFVgo/vLbkLMEbgQecYzC7kq79CA/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGtKCRFVgo/vLbkLMEbgQecYzC7kq79CA/view?embed',
    blogLinks: [],
    keyFeatures: [
      'Complete slide deck generation from prompts',
      'Automatic template and theme selection',
      'Smart image and data visualization suggestions',
      'Brand-consistent styling and formatting',
    ],
    realWorldExample: {
      company: 'Workday Rebrands 23K Slides with Prezent.ai',
      challenge:
        'Workday’s team needed to rebrand 23,000 customer-facing slides in just six weeks. Manual updates of fonts, layouts, and messaging would take too long and cost too much.',
      solution:
        'Prezent.ai automated the transformation of outdated slides into on-brand presentations at scale, handling fonts, layouts, and consistency instantly.',
      impact: 'Workday reduced 80% of manual work, saved $676K in agency fees, and achieved 100% positive feedback from its consultants.',
      caseStudyUrl: 'https://www.prezent.ai/case-studies/how-workday-rebranded-23k-slides-in-record-time-and-saved-675k',
    },
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'avatars',
    title: 'GenAI in Virtual Avatars',
    subtitle: 'AI-powered video content creation',
    description:
      'Create professional video content with AI avatars that can speak multiple languages, maintain brand consistency, and produce content at scale without traditional video production costs.',
    icon: PhotoIcon,
    canvaUrl: 'https://www.canva.com/design/DAGtD2O8q5c/35NRZCjHWxBOP0E9lzXGWw/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGtD2O8q5c/35NRZCjHWxBOP0E9lzXGWw/view?embed',
    blogLinks: [],
    keyFeatures: [
      'Realistic AI avatar video generation',
      'Multi-language support with natural voice synthesis',
      'Brand-consistent avatar customization',
      'Automated video production workflows',
    ],
    realWorldExample: {
      company: 'Digital Solutions Firm',
      challenge:
        'Plain-text proposals failed to engage prospects at scale, and the team needed a personalized video touch without the cost and logistics of live shoots.',
      solution:
        'Used Vidyard’s AI Avatar Builder to record one core script and auto-generate personalized avatar intros, embedding these personalized clips into email proposals with CRM-driven data for customization.',
      impact: 'Proposal engagement increased by 760% and meeting bookings quadrupled, significantly improving lead quality and conversion.',
      caseStudyUrl: 'https://www.vidyard.com/case-studies/review-that-place/',
    },
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'animations',
    title: 'GenAI in Animations',
    subtitle: 'Automated animation and video creation',
    description:
      'Transform scripts and ideas into fully animated videos without technical animation skills. AI handles character creation, scene design, and animation sequences automatically.',
    icon: PlayIcon,
    canvaUrl: 'https://www.canva.com/design/DAGwD3VRkN8/KfUX4uwY4BE9214xDyfXRQ/view',
    canvaEmbedUrl: 'https://www.canva.com/design/DAGwD3VRkN8/KfUX4uwY4BE9214xDyfXRQ/view?embed',
    blogLinks: [],
    keyFeatures: [
      'Script-to-animation conversion',
      'Automated character and scene generation',
      'Cross-scene consistency and continuity',
      'Multi-language voiceover and lip-sync',
    ],
    realWorldExample: {
      company: 'Runway',
      challenge:
        'Professional video production required high budgets, specialized skills, and complex tools, making it inaccessible for many creators and businesses.',
      solution:
        'Developed Runway Gen-3, a next-generation AI video model offering text-to-video, image-to-video, and video-to-video generation with advanced controls like Motion Brush, Director Mode, and extendable clips.',
      impact:
        'Enabled creators to produce cinematic-quality videos quickly and affordably, democratizing access to high-fidelity video production and reducing dependence on traditional studios.',
      caseStudyUrl:
        'https://runwayml.com/product?utm_source=google&utm_medium=sem&utm_campaign=branded&utm_content=ad&gad_source=1&gad_campaignid=22452532935&gbraid=0AAAAABiY0sOugWSiHsMO8xo0N3BTLMeNB&gclid=CjwKCAjwkvbEBhApEiwAKUz6-3DuiUz5rV3M1T0JmYk0J-1GlVGjvORVx8wQm4vDXrkahHM3av4K0RoCm3IQAvD_BwE',
    },
    gradient: 'from-rose-500 to-pink-500',
  },
];

export default function GenAIBusinessCases() {
  const [selectedCase, setSelectedCase] = useState<GenAIUseCase | null>(null);

  const handleViewFlyer = (useCase: GenAIUseCase) => {
    setSelectedCase(useCase);
  };

  const handleCloseModal = () => {
    setSelectedCase(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900 to-purple-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-4 py-2 text-sm font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30 backdrop-blur-sm">
              <SparklesIcon className="h-4 w-4" />
              Real-World GenAI Implementation Cases
            </div>

            <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-6xl">
              GenAI in Business:{' '}
              <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Real Cases & Success Stories</span>
            </h1>

            <p className="mt-6 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
              Discover how leading companies are transforming their operations with Generative AI across 7 key business areas. From data analytics to customer
              support, see real implementations, success metrics, and actionable strategies.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ChartBarIcon className="h-5 w-5" />
                <span>7 Business Areas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <UserGroupIcon className="h-5 w-5" />
                <span>Real Company Cases</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <EyeIcon className="h-5 w-5" />
                <span>Interactive Flyers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="relative py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="space-y-8">
            {genaiUseCases.map((useCase, index) => (
              <div
                key={useCase.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="p-8 lg:p-10">
                  {/* Header Section */}
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${useCase.gradient} shadow-lg`}>
                        <useCase.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-1">{useCase.title}</h2>
                        <p className="text-base text-gray-300">{useCase.subtitle}</p>
                      </div>
                    </div>
                    {/* Action Buttons - moved to header */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewFlyer(useCase)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${useCase.gradient} text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Flyer
                      </button>
                      <Link
                        href={useCase.canvaUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 font-medium hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-300"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        Canva
                      </Link>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-8 leading-relaxed text-base">{useCase.description}</p>

                  {/* Main Content Grid */}
                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column - Key Capabilities (40% width) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Key Features */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <SparklesIcon className="h-5 w-5 text-indigo-400" />
                          Key Capabilities
                        </h3>
                        <ul className="space-y-3">
                          {useCase.keyFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-300">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.gradient} mt-2 flex-shrink-0`} />
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column - Success Story (60% width) */}
                    <div className="lg:col-span-3 space-y-6">
                      {useCase.realWorldExample && (
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ChartBarIcon className="h-5 w-5 text-green-400" />
                            Success Story: {useCase.realWorldExample.company}
                          </h3>
                          {useCase.realWorldExample.caseStudyUrl ? (
                            <Link
                              href={useCase.realWorldExample.caseStudyUrl}
                              target="_blank"
                              className="block p-5 rounded-xl bg-gray-800/60 border border-gray-600/50 hover:border-indigo-500/50 transition-all duration-200 group"
                            >
                              <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-red-400 min-w-[80px]">Challenge:</span>
                                  <span className="leading-relaxed">{useCase.realWorldExample.challenge}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-blue-400 min-w-[80px]">Solution:</span>
                                  <span className="leading-relaxed">{useCase.realWorldExample.solution}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-green-400 min-w-[80px]">Impact:</span>
                                  <span className="leading-relaxed">{useCase.realWorldExample.impact}</span>
                                </div>
                                <div className="flex items-center justify-end mt-3">
                                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="p-5 rounded-xl bg-gray-800/60 border border-gray-600/50">
                              <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-red-400 min-w-[80px]">Challenge:</span>
                                  <span className="leading-relaxed">{useCase.realWorldExample.challenge}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-blue-400 min-w-[80px]">Solution:</span>
                                  <span className="leading-relaxed">{useCase.realWorldExample.solution}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold text-green-400 min-w-[80px]">Impact:</span>
                                  <span className="leading-relaxed">{useCase.realWorldExample.impact}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Blog Links - Full Width at Bottom */}
                  {useCase.blogLinks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-700/50">
                      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <AcademicCapIcon className="h-5 w-5 text-purple-400" />
                        Related Articles
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {useCase.blogLinks.map((blog, idx) => (
                          <Link
                            key={idx}
                            href={blog.url}
                            target="_blank"
                            className="block p-4 rounded-lg bg-gray-800/40 border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-200 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h5 className="font-medium text-white group-hover:text-indigo-400 transition-colors text-sm leading-tight">{blog.title}</h5>
                                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{blog.description}</p>
                              </div>
                              <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-400 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10" />
        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Business with GenAI?</h2>
          <p className="text-lg text-gray-300 mb-8">
            If you want to implement these GenAI solutions or need expert consultations for your business transformation, we’re here to help you succeed.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
          >
            <SparklesIcon className="h-5 w-5" />
            Contact Us
          </Link>
        </div>
      </section>

      {/* Modal for Canva Flyers */}
      {selectedCase && (
        <CanvaViewModal open={!!selectedCase} onClose={handleCloseModal} title={`${selectedCase.title} - Detailed Overview`} src={selectedCase.canvaEmbedUrl} />
      )}
    </>
  );
}
