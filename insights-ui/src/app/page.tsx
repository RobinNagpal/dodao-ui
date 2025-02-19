import AllInOnePlatform from '@/components/home-page/AllInOnePlatform';
import Features from '@/components/home-page/Features';
import { Footer } from '@/components/home-page/Footer';
import { Hero } from '@/components/home-page/Hero';
import Highlights from '@/components/home-page/Highlights';
import { CSSProperties } from 'react';

const style: CSSProperties = {
  '--primary-color': '#2563eb',
  '--primary-text-color': '#fff',
  '--bg-color': '#fff',
  '--text-color': '#282c6e',
  '--link-color': '#2563eb',
  '--heading-color': '#ffffff',
  '--border-color': '#282c6e',
  '--block-bg': '#fff',
  '--swiper-theme-color': '',
} as CSSProperties;

export default function Home() {
  return (
    <div style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
      <Hero />
      <AllInOnePlatform />
      <Features />
      <Highlights />

      <Footer />
    </div>
  );
}
