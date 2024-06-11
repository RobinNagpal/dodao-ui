import { CssTheme, ThemeKey, themes } from '@dodao/web-core/src/components/app/themes';
import { Session } from '@dodao/web-core/types/auth/Session';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { SpaceProvider } from '@dodao/web-core/ui/contexts/SpaceContext';
import { getGTagId } from '@dodao/web-core/utils/analytics/getGTagId';
import { getSpaceServerSide } from '@dodao/web-core/api/auth/getSpaceServerSide';
import StyledComponentsRegistry from '@dodao/web-core/utils/StyledComponentsRegistry';
import { Analytics } from '@vercel/analytics/react';
import { AuthOptions, getServerSession } from 'next-auth';
import Script from 'next/script';
import { CSSProperties, ReactNode } from 'react';
import 'tailwindcss/tailwind.css';
import './globals.scss';

interface RootLayoutProps {
  children: ReactNode;
}

export interface CreateRootLayoutOptions {
  authOptions: AuthOptions;
  getChildLayout: (props: { session: Session | null; space: any; spaceError: boolean }) => ReactNode;
}

export default async function RootLayout({ children, authOptions, getChildLayout }: RootLayoutProps & CreateRootLayoutOptions) {
  const session = (await getServerSession(authOptions)) as Session | null;
  const space = await getSpaceServerSide();
  const gtag = getGTagId(space);

  const skin = space?.skin;
  const theme: ThemeKey = space?.skin && Object.keys(CssTheme).includes(skin || '') ? (skin as CssTheme) : CssTheme.GlobalTheme;

  const themeValue = space?.themeColors || themes[theme];

  const style = {
    '--primary-color': themeValue.primaryColor,
    '--bg-color': themeValue.bgColor,
    '--text-color': themeValue.textColor,
    '--link-color': themeValue.linkColor,
    '--heading-color': themeValue.headingColor,
    '--border-color': themeValue.borderColor,
    '--block-bg': themeValue.blockBg,
  } as CSSProperties;

  const ChildLayout = getChildLayout({ session, space, spaceError: false });

  return (
    <html lang="en" className="h-full">
      <body className={'max-h-screen ' + theme} style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
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
            <NotificationProvider>{getChildLayout({ session, space, spaceError: false })}</NotificationProvider>
          </SpaceProvider>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}
