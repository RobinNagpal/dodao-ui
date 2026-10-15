import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import TidbitsHubComponent from './tidbitshub';

export const metadata: Metadata = {
  title: 'Tidbits Hub - Quick, Impactful Learning for Your Customers | DoDAO',
  description:
    'Tidbits Hub by DoDAO offers short, impactful content with interactive demos and quizzes to enhance learning and customer engagement in just minutes.',
  keywords: [
    'Tidbits Hub',
    'Bite-Sized Learning',
    'Quick Learning',
    'Interactive Demos',
    'Customer Education',
    'DoDAO Products',
    'Learning Platform',
    'Blockchain Education',
    'DeFi Education',
    'Customer Engagement',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products/tidbitshub',
  },
  openGraph: {
    title: 'Tidbits Hub - Quick, Impactful Learning for Your Customers | DoDAO',
    description:
      'Discover Tidbits Hub by DoDAO, a platform that uses short, engaging content, interactive demos, and quizzes to transform learning and boost customer engagement.',
    url: 'https://dodao.io/home-section/dodao-io/products/tidbitshub',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tidbits Hub - Quick, Impactful Learning for Your Customers | DoDAO',
    description: 'Explore Tidbits Hub, DoDAO’s innovative platform for quick, interactive learning that boosts customer knowledge and engagement.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function TidbitsHubPage() {
  return (
    <PageWrapper>
      <TidbitsHubComponent />
    </PageWrapper>
  );
}

export default TidbitsHubPage;
