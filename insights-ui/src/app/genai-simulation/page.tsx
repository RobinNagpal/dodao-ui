import { Metadata } from 'next';
import {
  HeroSection,
  HowItWorksSection,
  SubjectsSection,
  BenefitsSection,
  FeaturesSection,
  DemoSection,
  FAQSection,
  CTASection,
} from '@/components/genai-simulation';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'GenAI Business Simulations | KoalaGains';
  const description =
    'Revolutionary GenAI simulation platform for business education. Guide students through realistic case studies while teaching AI prompting skills across Marketing, Finance, Operations, HR, and Economics.';
  const canonicalUrl = 'https://koalagains.com/genai-simulation';

  const keywords = [
    'GenAI simulations',
    'business education',
    'AI simulation platform',
    'higher education',
    'business case studies',
    'AI prompting skills',
    'interactive learning',
    'academic simulation',
    'business simulation',
    'AI literacy',
    'educational technology',
    'MBA simulation',
    'business training',
    'AI-powered learning',
    'student engagement',
    'professor tools',
    'real-time monitoring',
    'case study platform',
    'business analysis',
    'AI education',
    'KoalaGains',
  ];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords,
  };
}

export default function AISimulationPage() {
  return (
    <main className="bg-gray-900 overflow-hidden">
      <HeroSection />
      <SubjectsSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FeaturesSection />
      <DemoSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
