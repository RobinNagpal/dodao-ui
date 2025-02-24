import { themeColors } from '@/util/theme-colors';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import './globals.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KoalaGains',
  description: 'Making investments more insightful',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
        {children}
      </body>
    </html>
  );
}
