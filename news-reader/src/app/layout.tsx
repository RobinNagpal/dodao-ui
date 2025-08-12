import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProviderWrapper } from '@/providers/ThemeProviderWrapper';
import { NewsDataProviderWrapper } from '@/providers/NewsDataProviderWrapper';
import TopNav from '@/components/top-nav';
import './globals.scss';
import './plugins.css';

export const metadata: Metadata = {
  title: 'News Reader',
  description: 'News Reader',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>News Reader</title>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProviderWrapper>
          <NewsDataProviderWrapper>
            <TopNav />
            {children}
          </NewsDataProviderWrapper>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
