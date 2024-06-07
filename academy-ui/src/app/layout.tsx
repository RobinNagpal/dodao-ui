import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { CssTheme, ThemeKey, themes } from '@dodao/web-core/src/components/app/themes';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getGTagId } from '@dodao/web-core/utils/analytics/getGTagId';
import { getSpaceServerSide } from '@/utils/api/getSpaceServerSide';
import { Analytics } from '@vercel/analytics/react';
import { getServerSession } from 'next-auth';
import Script from 'next/script';
import { CSSProperties, ReactNode } from 'react';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import InternalLayout from './InternalLayout';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
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

        <InternalLayout session={session as Session} space={space} spaceError={!space}>
          {children}
        </InternalLayout>

        <Analytics />
      </body>
    </html>
  );
}
