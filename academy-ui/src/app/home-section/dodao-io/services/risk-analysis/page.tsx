import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RiskAnalysis from './risk-analysis.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeFi Risk Analysis Services | DoDAO',
  description:
    'DoDAO provides on-chain risk analysis services with advanced models like Monte Carlo and GARCH, enabling DeFi protocols to manage volatility and safeguard user assets.',
  keywords: [
    'DeFi Risk Analysis',
    'Blockchain Risk Management',
    'Monte Carlo Simulations',
    'GARCH Model',
    'Liquidation Risk',
    'Economic Security Index',
    'Risk Management Tools',
    'DeFi Protocol Security',
    'DoDAO Services',
    'On-Chain Analytics',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/risk-analysis',
  },
  openGraph: {
    title: 'DeFi Risk Analysis Services | DoDAO',
    description:
      'Explore DoDAO’s advanced DeFi risk analysis tools, offering simulations and real-time metrics to help protocols anticipate and mitigate potential risks in volatile markets.',
    url: 'https://dodao.io/home-section/dodao-io/services/risk-analysis',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeFi Risk Analysis Services | DoDAO',
    description:
      'Discover DoDAO’s DeFi risk analysis solutions, from Monte Carlo simulations to Liquidations at Risk, designed to protect and stabilize DeFi protocols.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function RiskAnalysisPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <RiskAnalysis />
      </div>
    </PageWrapper>
  );
}

export default RiskAnalysisPage;
