import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import AiCrowdfundedComponent from './ai-crowdfunding-agent';

export const metadata: Metadata = {
  title: 'AI Crowdfunding Analyzer - Intelligent Investment Insights | DoDAO',
  description:
    'DoDAO’s AI Crowdfunding Analyzer revolutionizes the evaluation of crowdfunded startups by identifying both green and red flags. Empower your investment decisions with data-driven insights and comprehensive team evaluations.',
  keywords: [
    'AI Crowdfunding Analyzer',
    'AI Agent for startups',
    'AI Agent for Crowdfunding',
    'Investment Analysis',
    'AI Investment Tools',
    'Crowdfunded Startups',
    'Risk Assessment',
    'Team Evaluation',
    'DoDAO',
    'AI Financial Insights',
    'Data-driven Decisions',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products/ai-crowdfunding-agent',
  },
  openGraph: {
    title: 'AI Crowdfunding Analyzer - Intelligent Investment Insights | DoDAO',
    description:
      'Discover how DoDAO’s AI Agent uses to streamline investment decisions for crowdfunded startups. Evaluate team performance, financials, and market data—all in one comprehensive platform.',
    url: 'https://dodao.io/home-section/dodao-io/products/ai-crowdfunding-agent',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Crowdfunding Analyzer - Intelligent Investment Insights | DoDAO',
    description:
      'Evaluate crowdfunded ventures with AI Agent. DoDAO’s AI Crowdfunding Analyzer identifies green and red flags, helping investors make smarter, data-backed decisions.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function AiCrowdfundedPage() {
  return (
    <PageWrapper>
      <AiCrowdfundedComponent />
    </PageWrapper>
  );
}

export default AiCrowdfundedPage;
