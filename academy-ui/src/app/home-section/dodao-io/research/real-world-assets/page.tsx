import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import RealWorldAssets from './real-world-assets.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Real World Assets on Blockchain - Research and Integration | DoDAO',
    description:
      'DoDAO’s research on Real World Assets (RWAs) simplifies RWA integration on blockchain, offering insights into regulations, asset categories, and market trends.',
    keywords: [
      'Real World Assets',
      'RWA Blockchain Integration',
      'RWA Research',
      'Blockchain Regulations',
      'Asset Tokenization',
      'DoDAO Research',
      'RWA Compliance',
      'Securitization Structure',
      'Investment Opportunities',
      'RWA Market Trends',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/research/real-world-assets',
    },
    openGraph: {
      title: 'Real World Assets on Blockchain - Research and Integration | DoDAO',
      description:
        'Discover DoDAO’s research on Real World Assets, covering blockchain integration, compliance, and insights into global regulations and asset categories.',
      url: 'https://dodao.io/home-section/dodao-io/research/real-world-assets',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Real World Assets on Blockchain - Research and Integration | DoDAO',
      description: 'Explore DoDAO’s insights on integrating Real World Assets into blockchain, addressing compliance, regulations, and market trends.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function RealWorldAssetsPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <RealWorldAssets />
      </div>
    </PageWrapper>
  );
}

export default RealWorldAssetsPage;
