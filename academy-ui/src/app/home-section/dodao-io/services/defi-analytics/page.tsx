import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DefiAnalytics from './defi-analytics.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'DeFi Analytics Services | DoDAO',
    description:
      'DoDAO offers advanced DeFi analytics, providing comprehensive dashboards and real-time data to help protocols track on-chain activity and make data-driven decisions.',
    keywords: [
      'DeFi Analytics',
      'On-Chain Analytics',
      'Blockchain Market Insights',
      'Asset Analysis Dashboard',
      'Market Sentiment Analysis',
      'Risk Management Tools',
      'DoDAO Services',
      'DeFi Protocol Analytics',
      'Real-Time Data Analysis',
      'DeFi Decision Making',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/services/defi-analytics',
    },
    openGraph: {
      title: 'DeFi Analytics Services | DoDAO',
      description:
        'Explore DoDAO’s advanced DeFi analytics, offering detailed dashboards and real-time data to empower your protocol’s data-driven decisions and risk management.',
      url: 'https://dodao.io/home-section/dodao-io/services/defi-analytics',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'DeFi Analytics Services | DoDAO',
      description:
        'Discover DoDAO’s comprehensive DeFi analytics solutions, from asset tracking to risk management tools, designed to support data-driven decision-making in DeFi protocols.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function DefiAnalyticsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DefiAnalytics />
      </div>
    </PageWrapper>
  );
}

export default DefiAnalyticsPage;
