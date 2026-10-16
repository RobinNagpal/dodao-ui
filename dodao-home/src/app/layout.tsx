import DoDAOHomeTopNav from '@/components/home/DoDAOHome/components/DoDAOHomeTopNav';
import { SITE_DESCRIPTION, SITE_SOCIAL_IMAGE, SITE_TITLE, SITE_URL } from '@/utils/siteConfig';
import { getGTagIdByHost } from '@dodao/web-core/utils/analytics/getGTagId';
import { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import Script from 'next/script';
import { CSSProperties, ReactNode } from 'react';
import './globals.scss';

// dodao.io typeface — the variable width axis gives the wide heading cut used
// by `.font-display` in `styles/dodao-home-theme.scss`.
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });

// Same GA property academy-ui used when it served dodao.io.
const GTAG_ID = getGTagIdByHost('dodao.io');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    'dodao',
    'DoDAO',
    'DoDAO Robotics',
    'Robotics Services',
    'Robot Simulation',
    'Gazebo',
    'Isaac Sim',
    'Synthetic Data',
    'YOLO Training Data',
    'Sim-to-Real',
    'AI Agents',
    'DeFi Tooling',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: 'website',
    images: [SITE_SOCIAL_IMAGE],
    siteName: 'DoDAO',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_SOCIAL_IMAGE],
    site: '@dodao_io',
    creator: '@dodao_io',
  },
};

const mainStyle: CSSProperties = {
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)',
  minHeight: 'calc(100vh - 118px)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`max-h-screen dodao-home-theme ${archivo.variable}`} style={{ backgroundColor: 'var(--bg-color)' }}>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`} />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GTAG_ID}');
        `}
        </Script>
        <DoDAOHomeTopNav />
        <main style={mainStyle}>{children}</main>
      </body>
    </html>
  );
}
