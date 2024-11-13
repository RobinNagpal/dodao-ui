import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import AiLlmDev from './ai-llm-dev.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'AI & LLM Development and Solutions | DoDAO',
    description:
      'DoDAO provides AI and Large Language Model (LLM) solutions for businesses, enhancing automation, decision-making, and user experiences through secure AI integration.',
    keywords: [
      'AI Development',
      'LLM Solutions',
      'Machine Learning',
      'AI Integration',
      'Enterprise AI Solutions',
      'DoDAO AI Services',
      'Natural Language Processing',
      'AI Security',
      'AI for Business',
      'Automation with AI',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/services/ai-llm-dev',
    },
    openGraph: {
      title: 'AI & LLM Development and Solutions | DoDAO',
      description:
        'Enhance your business with DoDAO’s AI and LLM solutions. Secure, custom AI integrations designed for improved automation, data-driven decision-making, and robust user experiences.',
      url: 'https://dodao.io/home-section/dodao-io/services/ai-llm-dev',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI & LLM Development and Solutions | DoDAO',
      description:
        'Discover DoDAO’s AI and LLM development solutions, tailored to optimize automation, strengthen security, and enhance decision-making in business environments.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function AiLlmDevPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <AiLlmDev />
      </div>
    </PageWrapper>
  );
}

export default AiLlmDevPage;
