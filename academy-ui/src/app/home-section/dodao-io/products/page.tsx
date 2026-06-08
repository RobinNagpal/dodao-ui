import DoDAOProducts from '@/components/home/DoDAOHome/components/DoDAOProducts';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | DoDAO',
  description:
    'The products DoDAO has shipped — KoalaGains for AI-powered investment insights, Tidbits Hub for micro-learning, DeFi Alerts for real-time DeFi monitoring, and Academy Sites for end-to-end learning platforms.',
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products',
  },
  openGraph: {
    title: 'Products | DoDAO',
    description: 'AI Agent, learning, and DeFi products built and shipped by DoDAO.',
    url: 'https://dodao.io/home-section/dodao-io/products',
    type: 'website',
    siteName: 'DoDAO',
  },
};

export default function ProductsPage() {
  return (
    <PageWrapper>
      <DoDAOProducts />
    </PageWrapper>
  );
}
