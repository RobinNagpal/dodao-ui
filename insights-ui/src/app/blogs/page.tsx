import BlogsGrid from '@/components/blogs/BlogsGrid';
import { getPostsData } from '@/util/blog-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KoalaGains Blog – REITs, Crowdfunding & Investment Insights',
  description:
    'Explore expert articles on REIT fundamentals, value‑investing techniques, crowdfunding analysis, equity research and GenAI capabilities. KoalaGains helps you stay informed and make smarter investment decisions.',
  alternates: {
    canonical: 'https://koalagains.com/blogs',
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    'KoalaGains Blog',
    'REIT analysis',
    'Crowdfunding insights',
    'Investment insights',
    'Financial analysis',
    'AI-driven insights',
    'REIT Analysis',
    'Equity Research',
    'Value Investing',
    'Investment Strategies',
  ],
  openGraph: {
    title: 'KoalaGains Blog – REITs, Crowdfunding & Investment Insights',
    description: 'Explore expert articles on REIT fundamentals, value‑investing techniques, crowdfunding analysis, equity research and GenAI capabilities.',
    url: 'https://koalagains.com/blogs',
    siteName: 'KoalaGains',
    type: 'website',
    images: [
      {
        url: 'https://koalagains.com/koalagain_logo.png',
        width: 1200,
        height: 630,
        alt: 'KoalaGains Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoalaGains Blog – REITs, Crowdfunding & Investment Insights',
    description: 'Explore expert articles on REIT fundamentals, value‑investing techniques, crowdfunding analysis, equity research and GenAI capabilities.',
    images: ['https://koalagains.com/koalagain_logo.png'],
  },
};

export default async function BlogsPage() {
  const posts = await getPostsData();

  return (
    <PageWrapper>
      <BlogsGrid posts={posts} />
    </PageWrapper>
  );
}
