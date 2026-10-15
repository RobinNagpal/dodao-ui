import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import DeFiAlertsComponent from './defialerts';

export const metadata: Metadata = {
  title: 'DeFi Alerts - Real-Time DeFi Intelligence | DoDAO',
  description:
    'DeFi Alerts provides real-time notifications for Compound and major DeFi protocols. Monitor supply/borrow rates, position health, and compare rates across Aave, Spark, and Morpho with custom thresholds and delivery channels.',
  keywords: [
    'DeFi Alerts',
    'Compound Finance',
    'DeFi Monitoring',
    'Real-time Alerts',
    'Supply APR',
    'Borrow APR',
    'Position Health',
    'Aave',
    'Spark',
    'Morpho',
    'DoDAO',
    'DeFi Analytics',
    'Yield Optimization',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products/defi-alerts',
  },
  openGraph: {
    title: 'DeFi Alerts - Real-Time DeFi Intelligence | DoDAO',
    description:
      'Monitor Compound markets, compare rates across DeFi protocols, and get personalized alerts for your positions. Built for Compound, extended for all major DeFi platforms.',
    url: 'https://dodao.io/home-section/dodao-io/products/defi-alerts',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeFi Alerts - Real-Time DeFi Intelligence | DoDAO',
    description:
      'Stay ahead of DeFi markets with real-time alerts for Compound, Aave, Spark, and Morpho. Monitor rates, positions, and opportunities with custom thresholds.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function DeFiAlertsPage() {
  return (
    <PageWrapper>
      <DeFiAlertsComponent />
    </PageWrapper>
  );
}

export default DeFiAlertsPage;
