import BlogsGrid from '@/components/blogs/BlogsGrid';
import { getPostsData } from '@/util/blog-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default async function BlogsPage() {
  const posts = await getPostsData();

  return (
    <PageWrapper>
      <BlogsGrid posts={posts} />
    </PageWrapper>
  );
}
