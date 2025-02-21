import AllInOnePlatform from '@/components/home-page/AllInOnePlatform';
import Architecture from '@/components/home-page/Architecture';
import Contact from '@/components/home-page/Contact';
import Features from '@/components/home-page/Features';
import { Footer } from '@/components/home-page/Footer';
import FromTheBlog from '@/components/home-page/FromTheBlog';
import { Hero } from '@/components/home-page/Hero';
import { getPostsData } from '@/util/blog-utils';
import { CSSProperties } from 'react';

const style: CSSProperties = {
  '--primary-color': '#4F46E5', // Indigo-600 for primary actions
  '--primary-text-color': '#ffffff', // Crisp white text on primary elements
  '--bg-color': '#1F2937', // Gray-800 for the main background
  '--text-color': '#D1D5DB', // Gray-300 for body text for good contrast
  '--link-color': '#4F46E5', // Matching the primary color for links
  '--heading-color': '#ffffff', // White for headings
  '--border-color': '#374151', // Gray-700 for subtle borders
  '--block-bg': '#374151', // A slightly lighter dark for block backgrounds
  '--swiper-theme-color': '#4F46E5', // Consistent with the primary color for Swiper components
} as CSSProperties;

export default async function Home() {
  const posts = await getPostsData();
  return (
    <div style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
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
