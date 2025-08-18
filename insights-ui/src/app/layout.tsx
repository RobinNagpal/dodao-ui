import TopNav from '@/components/core/TopNav/TopNav';
import { themeColors } from '@/util/theme-colors';
import type { Metadata } from 'next';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import Script from 'next/script';

// insights-ui\src\app\layout.tsx
export const metadata: Metadata = {
  title: 'KoalaGains',
  description: 'Making investments more insightful',
  keywords: [
    'KoalaGains',
    'Financial Reports',
    'AI-driven investing',
    'Financial Analysis on REITs',
    'Crowdfunding Projects',
    'Investment Insights',
    'Data-driven Investment Research',
    'Value Investing',
    'REIT Analysis',
    'Crowdfunding Analysis',
    'AI Investment Reports',
    'Deep Financial Insights',
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://koalagains.com/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KoalaGains',
    description: 'Making investments more insightful',
    images: ['https://koalagains.com/koalagain_logo.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
  openGraph: {
    title: 'KoalaGains',
    description: 'Making investments more insightful',
    url: 'https://koalagains.com/',
    type: 'website',
    images: ['https://koalagains.com/koalagain_logo.png'],
    siteName: 'KoalaGains',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="626f3994-7682-4573-a943-4987796f3eaf"></script>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap" />
      </head>
      <body className={`antialiased text-color`} style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
        <NotificationProvider>
          <>
            <NotificationWrapper />
            <TopNav />
            {children}
          </>
        </NotificationProvider>

        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=G-MYQG66ESX3`} />
          <Script id="google-analytics">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-MYQG66ESX3');
        `}
          </Script>
        </>
      </body>
    </html>
  );
}
