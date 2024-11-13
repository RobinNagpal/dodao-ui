import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import EducationalContent from './educational-content.mdx';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Educational Content Services for Blockchain & DeFi | DoDAO',
    description:
      'DoDAO offers customized educational content services to help your audience understand and embrace blockchain and DeFi technology. Discover guides, tutorials, interactive modules, and more.',
    keywords: [
      'Educational Content',
      'Blockchain Education',
      'DeFi Content Creation',
      'Customized Learning',
      'DoDAO Educational Services',
      'Blockchain Tutorials',
      'Interactive Learning',
      'Guides and Tutorials',
      'Blockchain Infographics',
      'DeFi Training Materials',
    ],
    authors: [{ name: 'DoDAO' }],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: 'https://dodao.io/home-section/dodao-io/education/educational-content',
    },
    openGraph: {
      title: 'Educational Content Services for Blockchain & DeFi | DoDAO',
      description:
        'DoDAO creates tailored educational content that enhances learning and engagement in blockchain and DeFi. Explore our guides, videos, and interactive modules.',
      url: 'https://dodao.io/home-section/dodao-io/education/educational-content',
      type: 'website',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      siteName: 'DoDAO',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Educational Content Services for Blockchain & DeFi | DoDAO',
      description:
        'Unlock the potential of blockchain and DeFi with DoDAO’s engaging, customized educational content. From guides to interactive modules, we make learning accessible.',
      images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

function EducationalContentPage() {
  return (
    <PageWrapper>
      <div className="markdown-body w-full">
        <EducationalContent />
      </div>
    </PageWrapper>
  );
}

export default EducationalContentPage;
