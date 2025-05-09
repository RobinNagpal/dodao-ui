import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ChildLayout } from '@/components/layout/ChildLayout';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { GlobalThemeColors } from '@dodao/web-core/components/app/themes';
import { Session } from '@dodao/web-core/types/auth/Session';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { getGTagIdByHost } from '@dodao/web-core/utils/analytics/getGTagId';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import StyledComponentsRegistry from '@dodao/web-core/utils/StyledComponentsRegistry';
import { Analytics } from '@vercel/analytics/react';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import Script from 'next/script';
import { CSSProperties, ReactNode } from 'react';
import 'tailwindcss/tailwind.css';
import './globals.scss';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')?.[0];
  const space = (await getSpaceServerSide())!;

  const gtag = getGTagIdByHost(host);

  const recognizedSpace =
    space?.id === PredefinedSpaces.DODAO_HOME ||
    space?.id === PredefinedSpaces.TIDBITS_HUB ||
    space?.type === SpaceTypes.AcademySite ||
    space?.type === SpaceTypes.TidbitsSite;

  const shouldLoadGA = recognizedSpace && gtag;

  const themeValue = space?.themeColors || GlobalThemeColors;

  const style = {
    '--primary-color': themeValue.primaryColor,
    '--primary-text-color': themeValue.primaryTextColor,
    '--bg-color': themeValue.bgColor,
    '--text-color': themeValue.textColor,
    '--link-color': themeValue.linkColor,
    '--heading-color': themeValue.headingColor,
    '--border-color': themeValue.borderColor,
    '--block-bg': themeValue.blockBg,
    '--swiper-theme-color': themeValue.primaryColor,
  } as CSSProperties;

  return (
    <html lang="en" className="h-full">
      <body className={'max-h-screen'} style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
        {shouldLoadGA && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`} />
            <Script id="google-analytics">
              {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', '${gtag}');
        `}
            </Script>
          </>
        )}
        <StyledComponentsRegistry>
          <NotificationProvider>
            <ChildLayout session={session} space={space} spaceError={!space}>
              {children}
            </ChildLayout>
          </NotificationProvider>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}
