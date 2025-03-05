import AllInOnePlatform from '@/components/home-page/AllInOnePlatform';
import Architecture from '@/components/home-page/Architecture';
import Contact from '@/components/home-page/Contact';
import Features from '@/components/home-page/Features';
import { Footer } from '@/components/home-page/Footer';
import BlogsGrid from '@/components/blogs/BlogsGrid';
import { Hero } from '@/components/home-page/Hero';
import { getPostsData } from '@/util/blog-utils';
import { themeColors } from '@/util/theme-colors';

export default async function Home() {
  const posts = await getPostsData(6);
  return (
    <div style={{ ...themeColors }}>
      <Hero />
      <Architecture />
      <Features />
      <AllInOnePlatform />
      <BlogsGrid posts={posts} />
      <Contact />
      <Footer />
    </div>
  );
}
