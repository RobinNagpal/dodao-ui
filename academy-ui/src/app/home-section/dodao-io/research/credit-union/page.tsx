import { Metadata } from 'next';
import { RenderContent } from './RenderContent';

export const metadata: Metadata = {
  title: 'How Credit Unions Can Attract Gen Z - Strategies for Engagement | DoDAO',
  description:
    'DoDAO’s research on helping credit unions attract Gen Z includes strategies for social media, content modernization, and engagement tailored for the tech-savvy generation.',
  keywords: [
    'Credit Unions',
    'Generation Z Engagement',
    'Attracting Gen Z',
    'Credit Union Marketing',
    'Gen Z Financial Behavior',
    'DoDAO Research',
    'Modern Social Media Strategies',
    'Financial Education for Gen Z',
    'Digital Financial Services',
    'Credit Union Growth',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/research/credit-union',
  },
  openGraph: {
    title: 'How Credit Unions Can Attract Gen Z - Strategies for Engagement | DoDAO',
    description:
      'Explore DoDAO’s strategies for helping credit unions engage Generation Z. From social media to content strategies, learn how to connect with this tech-savvy generation.',
    url: 'https://dodao.io/home-section/dodao-io/research/credit-union',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Credit Unions Can Attract Gen Z - Strategies for Engagement | DoDAO',
    description: 'Discover DoDAO’s insights on how credit unions can attract and engage Gen Z with tailored social media and content strategies.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function CreditUnionPage() {
  return <RenderContent />;
}

export default CreditUnionPage;
