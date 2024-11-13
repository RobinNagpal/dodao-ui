import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import BlockchainTooling from './blockchain-tooling.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blockchain Tooling Services | DoDAO',
  description:
    'DoDAO offers advanced blockchain tooling solutions trusted by top protocols, enhancing security, functionality, and development efficiency for blockchain projects.',
  keywords: [
    'Blockchain Tooling',
    'Blockchain Development Tools',
    'Smart Contract Testing',
    'Blockchain Security',
    'DoDAO Services',
    'Compound Enhancements',
    'CLI Tools for Blockchain',
    'Cross-Chain Functionality',
    'Blockchain Tool Innovation',
    'Blockchain Operations',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/blockchain-tooling',
  },
  openGraph: {
    title: 'Blockchain Tooling Services | DoDAO',
    description:
      'Explore DoDAO’s advanced blockchain tooling solutions, from enhanced security and cross-chain functionality to CLI tools, trusted by top protocols like Compound.',
    url: 'https://dodao.io/home-section/dodao-io/services/blockchain-tooling',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blockchain Tooling Services | DoDAO',
    description:
      'DoDAO provides innovative blockchain tooling for secure and efficient development, trusted by leading protocols. Discover our solutions for Compound and more.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function BlockchainToolingPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <BlockchainTooling />
      </div>
    </PageWrapper>
  );
}

export default BlockchainToolingPage;
