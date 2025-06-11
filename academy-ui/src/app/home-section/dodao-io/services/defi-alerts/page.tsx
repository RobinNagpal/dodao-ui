import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DefiAlerts from './defi-alerts.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeFi Alerts | DoDAO',
  description: 'DoDAO’s DeFi Alerts platform delivers real-time notifications for yield, risk, and portfolio health across any blockchain protocol.',
  keywords: ['DeFi Alerts', 'Real-time notifications', 'Yield optimization', 'DeFi risk management', 'DoDAO DeFi services', 'Compound alerts'],
  authors: [{ name: 'DoDAO' }],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/defi-alerts',
  },
  openGraph: {
    title: 'DeFi Alerts | DoDAO',
    description: 'Proactive, multi-channel alerts for supply, borrow, and position health across any chain or protocol.',
    url: 'https://dodao.io/home-section/dodao-io/services/defi-alerts',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeFi Alerts | DoDAO',
    description: 'Optimize your DeFi positions with real-time alerts for rates, yields, and risk across all protocols.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

export default function DeFiAlertsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DefiAlerts />
      </div>
    </PageWrapper>
  );
}
