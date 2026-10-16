import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import CustomAiAgentDev from './custom-ai-agent-dev';

export const metadata: Metadata = {
  title: 'Custom AI Agent Development | DoDAO',
  description:
    'DoDAO designs and ships custom AI agents that perceive your data, plan their work, take action, and learn over time — turning your repetitive cognitive workflows into a self-driving system.',
  keywords: [
    'Custom AI Agents',
    'AI Agent Development',
    'Autonomous Agents',
    'AI Automation',
    'Enterprise AI',
    'LLM Agents',
    'AI for Business',
    'DoDAO AI Services',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/custom-ai-agent-dev',
  },
  openGraph: {
    title: 'Custom AI Agent Development | DoDAO',
    description: 'Production AI agents that perceive, plan, act, and learn — built around your business, shipped into your stack.',
    url: 'https://dodao.io/home-section/dodao-io/services/custom-ai-agent-dev',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom AI Agent Development | DoDAO',
    description: 'Production AI agents that perceive, plan, act, and learn — built around your business.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

export default function CustomAiAgentDevPage() {
  return (
    <PageWrapper>
      <CustomAiAgentDev />
    </PageWrapper>
  );
}
