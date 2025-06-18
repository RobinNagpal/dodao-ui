import Contact from '@/components/home-page/Contact';
import { Footer } from '@/components/home-page/Footer';
import BlogsGrid from '@/components/blogs/BlogsGrid';
import { Hero } from '@/components/home-page/Hero';
import KoalaGainsPlatform from '@/components/home-page/KoalaGainsPlatform';
import { getPostsData } from '@/util/blog-utils';
import { themeColors } from '@/util/theme-colors';

export default async function Home() {
  const posts = await getPostsData(6);
  return (
    <div style={{ ...themeColors }}>
      <Hero />
      <KoalaGainsPlatform />
      <BlogsGrid posts={posts} />
      <Contact />
      <Footer />
    </div>
  );
}
