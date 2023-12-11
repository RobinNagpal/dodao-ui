import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@/types/auth/Session';
import { getGTagId } from '@/utils/analytics/getGTagId';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { Analytics } from '@vercel/analytics/react';
import { getServerSession } from 'next-auth';
import Script from 'next/script';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import InternalLayout from './InternalLayout';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const space = await getSpaceServerSide();
  const gtag = getGTagId(space);
  return (
    <html lang="en" className="h-full">
      <body className="max-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`} />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${gtag}', {
            send_page_view: false
          });
        `}
        </Script>

        <InternalLayout session={session as Session} space={space} spaceError={!space}>
          {children}
        </InternalLayout>

        <Analytics />
      </body>
    </html>
  );
}
