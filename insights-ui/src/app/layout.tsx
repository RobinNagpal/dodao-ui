import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import { CSSProperties } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Agentic Insights',
  description: 'Agents progress and reports',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const style = {
    '--primary-color': '#f5c09a',
    '--primary-text-color': '#121212',
    '--bg-color': '#252736',
    '--text-color': '#ffffff',
    '--link-color': '#cb9772',
    '--heading-color': '#ffffff',
    '--border-color': '#d0d7de',
    '--block-bg': '#20212d',
    '--swiper-theme-color': '',
  } as CSSProperties;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
        {children}
      </body>
    </html>
  );
}
