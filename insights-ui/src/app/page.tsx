import AllInOnePlatform from '@/components/home-page/AllInOnePlatform';
import Architecture from '@/components/home-page/Architecture';
import Contact from '@/components/home-page/Contact';
import Features from '@/components/home-page/Features';
import { Footer } from '@/components/home-page/Footer';
import FromTheBlog from '@/components/home-page/FromTheBlog';
import { Hero } from '@/components/home-page/Hero';
import { getPostsData } from '@/util/blog-utils';
import { themeColors } from '@/util/theme-colors';

export default async function Home() {
  const posts = await getPostsData();
  return (
    <div style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
      <Hero />
      <Architecture />
      <AllInOnePlatform />
      <Features />
      <FromTheBlog posts={posts} />
      <Contact />
      <Footer />
    </div>
  );
}
