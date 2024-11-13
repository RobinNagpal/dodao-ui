import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DecentralizedReviewSolution from './decen-sol-reviews.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research on Decentralized Solutions and Reviews | DoDAO',
  description:
    'DoDAO’s research on decentralized solutions and reviews focuses on enhancing transparency, accountability, and human coordination across sectors using decentralized systems.',
  keywords: [
    'Decentralized Solutions',
    'Decentralized Reviews',
    'Transparency in Decision-Making',
    'Accountability in Reviews',
    'DoDAO Research',
    'Human Coordination',
    'Public and Private Sectors',
    'Resource Utilization',
    'Blockchain Transparency',
    'Decentralized Systems',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/research/decen-sol-reviews',
  },
  openGraph: {
    title: 'Research on Decentralized Solutions and Reviews | DoDAO',
    description:
      'Explore DoDAO’s research on decentralized systems that promote transparency, accountability, and efficient resource utilization in public and private sectors.',
    url: 'https://dodao.io/home-section/dodao-io/research/decen-sol-reviews',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research on Decentralized Solutions and Reviews | DoDAO',
    description:
      'Discover DoDAO’s research on how decentralized mechanisms can improve transparency, accountability, and coordination in both public and private sectors.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function DecentralizedSolutionReviewsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DecentralizedReviewSolution />
      </div>
    </PageWrapper>
  );
}

export default DecentralizedSolutionReviewsPage;
