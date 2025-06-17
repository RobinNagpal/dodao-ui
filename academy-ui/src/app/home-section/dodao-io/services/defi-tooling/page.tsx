import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import DeFiTooling from './defi-tooling.mdx';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeFi Tooling Services | DoDAO',
  description:
    'DoDAO offers advanced DeFi tooling solutions trusted by top protocols, enhancing security, functionality, and development efficiency for DeFi projects.',
  keywords: [
    'DeFi Tooling',
    'DeFi Development Tools',
    'Smart Contract Testing',
    'DeFi Security',
    'DoDAO Services',
    'Compound Enhancements',
    'CLI Tools for DeFi',
    'Cross-Chain Functionality',
    'DeFi Tool Innovation',
    'DeFi Operations',
  ],
  authors: [{ name: 'DoDAO' }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://dodao.io/home-section/dodao-io/services/defi-tooling',
  },
  openGraph: {
    title: 'DeFi Tooling Services | DoDAO',
    description:
      'Explore DoDAO’s advanced DeFi tooling solutions, from enhanced security and cross-chain functionality to CLI tools, trusted by top protocols like Compound.',
    url: 'https://dodao.io/home-section/dodao-io/services/defi-tooling',
    type: 'website',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeFi Tooling Services | DoDAO',
    description:
      'DoDAO provides innovative DeFi tooling for secure and efficient development, trusted by leading protocols. Discover our solutions for Compound and more.',
    images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

function DeFiToolingPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <DeFiTooling />
      </div>
    </PageWrapper>
  );
}

export default DeFiToolingPage;
