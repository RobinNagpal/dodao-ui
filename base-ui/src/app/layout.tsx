import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SpaceProvider } from '@/contexts/SpaceContext';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { GlobalThemeColors } from '@dodao/web-core/components/app/themes';
import { Session } from '@dodao/web-core/types/auth/Session';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { getGTagId } from '@dodao/web-core/utils/analytics/getGTagId';
import StyledComponentsRegistry from '@dodao/web-core/utils/StyledComponentsRegistry';
import { PrismaClient } from '@prisma/client';
import { Analytics } from '@vercel/analytics/react';
import { getServerSession } from 'next-auth';
import Script from 'next/script';
import { CSSProperties, ReactNode } from 'react';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import { ChildLayout } from './ChildLayout';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const p = new PrismaClient();
  const session = (await getServerSession(authOptions)) as Session | null;
  const space = (await getSpaceServerSide())!;
  const gtag = getGTagId(space);

  const themeValue = space?.themeColors || GlobalThemeColors;

  const style = {
    '--primary-color': themeValue.primaryColor,
    '--bg-color': themeValue.bgColor,
    '--text-color': themeValue.textColor,
    '--link-color': themeValue.linkColor,
    '--heading-color': themeValue.headingColor,
    '--border-color': themeValue.borderColor,
    '--block-bg': themeValue.blockBg,
  } as CSSProperties;

  return (
    <html lang="en" className="h-full">
      <body className={'max-h-screen'} style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
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
        <StyledComponentsRegistry>
          <SpaceProvider>
            <NotificationProvider>
              <ChildLayout session={session} space={space} spaceError={!space}>
                {children}
              </ChildLayout>
            </NotificationProvider>
          </SpaceProvider>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}
