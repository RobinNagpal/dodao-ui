import BlogsGrid from '@/components/blogs/BlogsGrid';
import { getPostsData } from '@/util/blog-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KoalaGains Blog – REITs, Crowdfunding & Investment Insights',
  description:
    'Dive into expert articles on REIT performance, crowdfunding analysis, advanced AI-driven strategies, and more. KoalaGains helps you stay informed and make smarter investment decisions.',
  alternates: {
    canonical: 'https://koalagains.com/blogs',
  },
  keywords: [
    'KoalaGains Blog',
    'REITs',
    'Crowdfunding',
    'Investment Insights',
    'Financial Analysis',
    'AI-driven insights',
    'REIT Analysis',
    'Crowdfunding Reports',
  ],
};

export default async function BlogsPage() {
  const posts = await getPostsData();

  return (
    <PageWrapper>
      <BlogsGrid posts={posts} />
    </PageWrapper>
  );
}
