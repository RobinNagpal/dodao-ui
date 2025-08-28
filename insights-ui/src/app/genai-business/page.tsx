import { Metadata } from 'next';
import GenAIBusinessCases from '@/components/genai-business/GenAIBusinessCases';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'GenAI in Business - Real Cases & Implementation | KoalaGains';
  const description =
    'Discover how leading companies are using Generative AI across 7 key business areas: data analytics, customer support, education, personalization, presentations, avatars, and animations. Real-world case studies and implementation strategies.';
  const canonicalUrl = 'https://koalagains.com/genai-business';

  const keywords = [
    'GenAI in business',
    'generative AI implementation',
    'AI business cases',
    'AI data analytics',
    'AI customer support',
    'AI personalization',
    'AI education',
    'AI presentations',
    'AI avatars',
    'AI animations',
    'business AI transformation',
    'AI automation',
    'enterprise AI solutions',
    'AI-powered business',
    'generative AI tools',
    'AI business strategy',
    'real-world AI applications',
    'AI success stories',
    'business intelligence AI',
    'conversational AI',
    'AI-driven insights',
    'automated content creation',
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

export default function GenAIBusinessPage() {
  return (
    <main className="bg-gray-900 overflow-hidden">
      <GenAIBusinessCases />
    </main>
  );
}
