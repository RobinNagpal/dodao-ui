import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import KoalaGainsComponent from './koalagains';

export const metadata: Metadata = {
  title: 'KoalaGains - Intelligent Investment Insights | DoDAO',
  description:
    'KoalaGains revolutionizes investment research with advanced AI-driven automation, enabling detailed insights on crowdfunding projects, REITs, and more. Empower your decisions with data-driven analysis and comprehensive financial reports.',
  keywords: [
    'KoalaGains',
    'AI for Investing',
    'Crowdfunding Analysis',
    'REIT Analysis',
    'Investment Analysis',
    'AI Investment Tools',
    'Risk Assessment',
    'Market Evaluation',
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
    canonical: 'https://dodao.io/home-section/dodao-io/products/koalagains',
  },
  openGraph: {
    title: 'KoalaGains - Intelligent Investment Insights | DoDAO',
    description:
      'Discover how KoalaGains uses AI to streamline investment research across crowdfunding projects, REITs, and more. Evaluate performance, financials, and market data—all in one platform.',
    url: 'https://dodao.io/home-section/dodao-io/products/koalagains',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoalaGains - Intelligent Investment Insights | DoDAO',
    description:
      'Evaluate crowdfunding ventures, REITs, and more with KoalaGains. Our AI-driven platform simplifies data analysis for smarter, data-backed investment decisions.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function KoalaGainsPage() {
  return (
    <PageWrapper>
      <KoalaGainsComponent />
    </PageWrapper>
  );
}

export default KoalaGainsPage;
