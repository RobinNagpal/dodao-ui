import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DecenReviews from './decen-reviews.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Decentralized Solutions & Reviews - Building Trust and Transparency | DoDAO',
    description:
      'DoDAO’s decentralized solutions and reviews empower public participation, ensure trustworthy evaluations, and promote transparency in public and private sectors.',
    keywords: [
      'Decentralized Solutions',
      'Decentralized Reviews',
      'Public Participation',
      'Transparent Evaluations',
      'DoDAO Products',
      'Community Solutions',
      'Trustworthy Reviews',
      'Feedback Mechanism',
      'Blockchain Transparency',
      'Trust and Accountability',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/products/decen-reviews',
    },
    openGraph: {
      title: 'Decentralized Solutions & Reviews - Building Trust and Transparency | DoDAO',
      description:
        'Explore DoDAO’s decentralized solutions and review systems, designed to foster transparency, accountability, and active public participation in decision-making processes.',
      url: 'https://dodao.io/home-section/dodao-io/products/decen-reviews',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Decentralized Solutions & Reviews - Building Trust and Transparency | DoDAO',
      description: 'DoDAO’s decentralized solutions enhance public participation, promote trustworthy reviews, and build transparency across sectors.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function DecentralizedReviewsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DecenReviews />
      </div>
    </PageWrapper>
  );
}

export default DecentralizedReviewsPage;
