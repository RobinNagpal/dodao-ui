import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';
import AcademySitesComponent from './academysites';

export const metadata: Metadata = {
  title: 'Academy Sites - Tailored Learning for Blockchain and DeFi | DoDAO',
  description:
    'Academy Sites by DoDAO provides a versatile educational platform with guides, tidbits, clickable demos, and courses to enhance learning in blockchain and DeFi.',
  keywords: [
    'Academy Sites',
    'Blockchain Education',
    'DeFi Learning',
    'Interactive Learning',
    'Guides and Tutorials',
    'Clickable Demos',
    'Nano-Courses',
    'Educational Platform',
    'DoDAO Academy',
    'Blockchain Courses',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/products/academysites',
  },
  openGraph: {
    title: 'Academy Sites - Tailored Learning for Blockchain and DeFi | DoDAO',
    description:
      'Explore Academy Sites by DoDAO, offering guides, interactive tidbits, clickable demos, and in-depth courses to enhance learning in blockchain and DeFi.',
    url: 'https://dodao.io/home-section/dodao-io/products/academysites',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Academy Sites - Tailored Learning for Blockchain and DeFi | DoDAO',
    description:
      'Academy Sites by DoDAO offers versatile educational resources, including guides, interactive tidbits, and courses, for a comprehensive learning experience in blockchain and DeFi.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function AcademySitesPage() {
  return (
    <PageWrapper>
      <AcademySitesComponent />
    </PageWrapper>
  );
}

export default AcademySitesPage;
