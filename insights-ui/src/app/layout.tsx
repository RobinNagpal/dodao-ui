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
import LogRocketComponent from './LogRocketComponent';

export const experimental_ppr = true;

// insights-ui/src/app/layout.tsx
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
        <LogRocketComponent />

        <Script id="amazon-connect-chat" strategy="afterInteractive">
          {`
    (function(w, d, x, id){
      var s = d.createElement('script');
      s.src = 'https://koalagains.my.connect.aws/connectwidget/static/amazon-connect-chat-interface-client.js';
      s.async = 1;
      s.id = id;
      d.getElementsByTagName('head')[0].appendChild(s);
      w[x] = w[x] || function() { (w[x].ac = w[x].ac || []).push(arguments) };
    })(window, document, 'amazon_connect', '74fa8d5d-f149-476f-8315-1c1233b3eb09');

    // basic styling
    amazon_connect('styles', {
      iconType: 'CHAT',
      openChat: { color: '#ffffff', backgroundColor: '#6366f1' },
      closeChat: { color: '#ffffff', backgroundColor: '#6366f1' }
    });

    // 🔑 customization object
    amazon_connect('customizationObject', {
      header: { 
        dropdown: true,                 // shows menu in header
      },
      transcript: {
        eventNames: {
          customer: "You",
          agent: "Koala Support"
        },
        displayIcons: false             // hide default icons if you want cleaner look
      },
      composer: {
        alwaysHideToolbar: true,        // 👉 hides the bold/italic toolbar
        disableEmojiPicker: true,       // optional: remove emoji button
        disableCustomerAttachments: true // optional: no file uploads
      },
      footer: {
        skipCloseChatButton: true       // optional: hide close button in footer
      },
    });

    amazon_connect('snippetId', 'QVFJREFIak5tL2RUNFhneWV5b2RFSFowb2FxOTY2UTAzQ1gwTko4NUZONTVMYVpydkFIN0tMcjMrSkRjcWhYVCswaDdaZy9EQUFBQWJqQnNCZ2txaGtpRzl3MEJCd2FnWHpCZEFnRUFNRmdHQ1NxR1NJYjNEUUVIQVRBZUJnbGdoa2dCWlFNRUFTNHdFUVFNQWU1dnU2RS9yZGFhMm5ENEFnRVFnQ3ZOeGpKdkFyODZtcjA5NGt0YnBMMnZvL05Ubm90YUFKQjRHSmFmdlZ4T1BMaUErM1ViRjBhaXJTNU46OmNFMFZDbENUVTdZL3NaZmxUZVZiTGZpbmE0R2czMmttM2cwY1FtdHZWKzdRQVJ2R1BodFZrdUhDemVvcDdUZzF6RlA1NG9NMDZwWnIreG5VRVVDUWlTeEVsNnAwbUE0bG14UmhsbEE4eDFGRXpEc3QrSytWbmRNR0Jqci9DOXFyODd6by9rWkxSUEFFTWZnNkhhOHpka2ZWR3JCUVlBTT0=');

    amazon_connect('supportedMessagingContentTypes', [
      'text/plain',
      'text/markdown',
      'application/vnd.amazonaws.connect.message.interactive',
      'application/vnd.amazonaws.connect.message.interactive.response'
    ]);
  `}
        </Script>
      </body>
    </html>
  );
}
