import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SmartContract from './smart-contract.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Smart Contract Development Services | DoDAO',
    description:
      'DoDAO provides custom smart contract development, optimization, auditing, and integration solutions for DeFi and blockchain projects, with expertise in secure, scalable contracts.',
    keywords: [
      'Smart Contract Development',
      'Blockchain Development',
      'DeFi Solutions',
      'Custom Smart Contracts',
      'Smart Contract Optimization',
      'Smart Contract Audits',
      'DoDAO Services',
      'Smart Contract Upgrades',
      'Blockchain Integration',
      'Decentralized Finance',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/services/smart-contract',
    },
    openGraph: {
      title: 'Smart Contract Development Services | DoDAO',
      description:
        'Explore DoDAO’s smart contract solutions, from custom development and optimization to audits and integration, designed to empower DeFi and blockchain projects.',
      url: 'https://dodao.io/home-section/dodao-io/services/smart-contract',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/dodao_smart_contract.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Smart Contract Development Services | DoDAO',
      description:
        'Discover DoDAO’s secure and scalable smart contract solutions, including custom development, audits, and upgrades for blockchain and DeFi projects.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/dodao_smart_contract.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function SmartContractPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <SmartContract />
      </div>
    </PageWrapper>
  );
}

export default SmartContractPage;
