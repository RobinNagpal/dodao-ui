import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import SessionProvider from '@/app/providers/SessionProvider';
import TopNav from '@/components/core/TopNav/TopNav';
import { themeColors } from '@/util/theme-colors';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import Script from 'next/script';

// insights-ui/src/app/layout.tsx
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="antialiased text-color" style={{ ...themeColors, backgroundColor: 'var(--bg-color)' }}>
        <NotificationProvider>
          <SessionProvider session={session}>
            <NotificationWrapper />
            <TopNav />
            {children}
          </SessionProvider>
        </NotificationProvider>

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
      </body>
    </html>
  );
}
