import Contact from '@/components/home-page/Contact';
import { Footer } from '@/components/home-page/Footer';
import BlogsGrid from '@/components/blogs/BlogsGrid';
import { Hero } from '@/components/home-page/Hero';
import KoalaGainsPlatform from '@/components/home-page/KoalaGainsPlatform';
import KoalaGainsInsights from '@/components/home-page/KoalaGainsInsights';
import AIAgentTraining from '@/components/home-page/AIAgentTraining';
import AIAgentDevelopment from '@/components/home-page/AIAgentDevelopment';
import { getPostsData } from '@/util/blog-utils';
import { themeColors } from '@/util/theme-colors';

export default async function Home() {
  const posts = await getPostsData(6);
  return (
    <div style={{ ...themeColors }}>
      <Hero />
      <KoalaGainsPlatform />
      <KoalaGainsInsights />
      <AIAgentTraining />
      <AIAgentDevelopment />
      <BlogsGrid posts={posts} />
      <Contact />
      <Footer />
    </div>
  );
}
