import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import AiAgentBootcamp from './ai-agent-bootcamp.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Agent Bootcamp | DoDAO',
  description:
    'Join DoDAO’s AI Agent Bootcamp to learn how to design, build, and deploy intelligent agents using LLMs, prompt engineering, and real-world projects.',
  keywords: ['AI Agent Bootcamp', 'Prompt Engineering', 'LLM Training', 'AI Automation', 'DoDAO Training', 'AI Workshops', 'AI Agent Deployment'],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/education/ai-agent-bootcamp',
  },
  openGraph: {
    title: 'AI Agent Bootcamp | DoDAO',
    description: 'Join DoDAO’s AI Agent Bootcamp to master LLM fundamentals, advanced prompt techniques, and agent deployment through hands-on labs.',
    url: 'https://dodao.io/home-section/dodao-io/education/ai-agent-bootcamp',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agent Bootcamp | DoDAO',
    description: 'Hands-on AI Agent Bootcamp from DoDAO: learn LLMs, prompt engineering, and real deployments.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function AiAgentBootcampPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <AiAgentBootcamp />
      </div>
    </PageWrapper>
  );
}

export default AiAgentBootcampPage;
