import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { getGTagId } from '@/utils/analytics/getGTagId';
import StyledComponentsRegistry from '@/utils/StyledComponentsRegistry';
import { Analytics } from '@vercel/analytics/react';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import InternalLayout from './InternalLayout';
import Script from 'next/script';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = (await getServerSession(authOptions)) as Session | null;

  const reqHeaders = headers();

  const response = await axios.get(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/extended-space', {
    params: {
      domain: reqHeaders.get('host')!,
    },
  });

  const gtag = getGTagId(response?.data as SpaceWithIntegrationsFragment);
  return (
    <html lang="en" className="h-full">
      <body className="max-h-screen">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`} />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${gtag}');
        `}
        </Script>

        <StyledComponentsRegistry>
          <InternalLayout session={session as Session} space={response?.data as SpaceWithIntegrationsFragment} spaceError={response.status !== 200}>
            {children}
          </InternalLayout>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}
