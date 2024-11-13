import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import BlockchainBootcamp from './blockchain-bootcamp.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blockchain Bootcamp - Empowering Your Team with Blockchain Knowledge | DoDAO',
    description:
      'Unlock the power of blockchain technology with DoDAO’s Blockchain Bootcamp. Learn DeFi, NFTs, Layer 2 solutions, and more with practical, hands-on training designed for teams and professionals.',
    keywords: [
      'Blockchain Bootcamp',
      'Blockchain Training',
      'DeFi Education',
      'NFT Learning',
      'Layer 2 Solutions',
      'Blockchain Concepts',
      'DoDAO Education',
      'Blockchain Technology Training',
      'Cross-chain Interactions',
      'Web3 and Gaming',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/education/blockchain-bootcamp',
    },
    openGraph: {
      title: 'Blockchain Bootcamp - Empowering Your Team with Blockchain Knowledge | DoDAO',
      description:
        'Learn blockchain from basics to advanced concepts with DoDAO’s comprehensive Blockchain Bootcamp. Ideal for teams wanting hands-on training in DeFi, NFTs, and Web3 applications.',
      url: 'https://dodao.io/home-section/dodao-io/education/blockchain-bootcamp',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blockchain Bootcamp - Empowering Your Team with Blockchain Knowledge | DoDAO',
      description:
        'DoDAO’s Blockchain Bootcamp teaches blockchain technology essentials and advanced concepts, empowering your team with hands-on learning in DeFi, NFTs, and more.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function BlockchainBootcampPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <BlockchainBootcamp />
      </div>
    </PageWrapper>
  );
}

export default BlockchainBootcampPage;
