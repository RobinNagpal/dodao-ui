import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import PromptEngineeringGuide from './prompt-engineering-guide.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt Engineering Guide | DoDAO',
  description: 'Master prompt engineering techniques to craft effective, optimized prompts for AI Agents and LLM workflows with DoDAO’s comprehensive guide.',
  keywords: ['Prompt Engineering', 'LLM Prompts', 'AI Agent Workflows', 'Prompt Optimization', 'DoDAO Guide', 'Advanced Prompting', 'AI Training'],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/education/prompt-engineering-guide',
  },
  openGraph: {
    title: 'Prompt Engineering Guide | DoDAO',
    description:
      'Explore DoDAO’s Prompt Engineering Guide to learn core principles, advanced techniques, and real-world strategies for maximizing AI performance.',
    url: 'https://dodao.io/home-section/dodao-io/education/prompt-engineering-guide',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Engineering Guide | DoDAO',
    description: 'Learn to craft, chain, and optimize prompts for AI Agents and LLMs with DoDAO’s expert guide—covering modules, examples, and best practices.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function PromptEngineeringPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <PromptEngineeringGuide />
      </div>
    </PageWrapper>
  );
}

export default PromptEngineeringPage;
