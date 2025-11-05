import TopNav from '@/components/core/TopNav/TopNav';
import { themeColors } from '@/util/theme-colors';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import type { Metadata } from 'next';
import Script from 'next/script';
import LogRocketComponent from './LogRocketComponent';
import Providers from './providers/Providers';

export const metadata: Metadata = {
  title: 'KoalaGains',
  description:
    'KoalaGains gives retail investors access to institutional-level reports—helping you understand a business, its financials, and the competition from first principles so you can make the best decisions when investing in a stock.',
  keywords: [
    'KoalaGains',
    'Institutional-level Reports',
    'First Principles Analysis',
    'Financial Statements',
    'Competitive Analysis',
    'Equity Research',
    'Financial Reports',
    'AI-driven investing',
    'Financial Analysis on REITs',
    'Crowdfunding Projects',
    'Investment Insights',
    'Data-driven Investment Research',
    'Value Investing',
    'Tariff Analysis',
    'REIT Analysis',
    'Crowdfunding Analysis',
    'AI Investment Reports',
    'Deep Financial Insights',
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://koalagains.com/' },
  twitter: {
    card: 'summary_large_image',
    title: 'KoalaGains',
    description:
      'Institutional-level reports for retail investors. Understand businesses, financials, and competition from first principles to make better stock decisions.',
    images: ['https://koalagains.com/koalagain_logo.png'],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
  openGraph: {
    title: 'KoalaGains',
    description:
      'KoalaGains gives retail investors access to institutional-level reports—helping you understand a business, its financials, and the competition from first principles so you can make the best decisions when investing in a stock.',
    url: 'https://koalagains.com/',
    type: 'website',
    images: ['https://koalagains.com/koalagain_logo.png'],
    siteName: 'KoalaGains',
    locale: 'en_US',
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased text-color dark" style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
        <Providers>
          <TopNav />
          {children}
        </Providers>

        {/* --- Analytics / Monitoring (non-blocking) --- */}

        {/* Umami */}
        <Script src="https://cloud.umami.is/script.js" strategy="afterInteractive" data-website-id="626f3994-7682-4573-a943-4987796f3eaf" />

        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-18CB8K6SLR" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-18CB8K6SLR');
          `}
        </Script>

        <Script id="amazon-connect-chat" src="/scripts/amazon-koala-chat.js" strategy="afterInteractive" />

        <LogRocketComponent />
      </body>
    </html>
  );
}
