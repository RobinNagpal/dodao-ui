import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { CssTheme, ThemeKey, themes } from '@/app/themes';
import { Session } from '@/types/auth/Session';
import { Themes } from '@/types/deprecated/models/enums';
import { getGTagId } from '@/utils/analytics/getGTagId';
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
  const isThemeCompound = space?.skin === Themes.Compound;
  const isThemeAave = space?.skin === Themes.Aave;
  const isThemeUniswap = space?.skin === Themes.Uniswap;
  const isThemeDoDAO = space?.skin === Themes.DoDAO;
  const isThemeFuse = space?.skin === Themes.Fuse;
  const isThemeBalancer = space?.skin === Themes.Balancer;
  const isThemeKleros = space?.skin === Themes.Kleros;
  const isOptimismTheme = space?.skin === Themes.Optimism;
  const isArbitrumTheme = space?.skin === Themes.Arbitrum;

  let theme: ThemeKey = CssTheme.GlobalTheme;

  if (isThemeAave) {
    theme = CssTheme.AaveTheme;
  } else if (isArbitrumTheme) {
    theme = CssTheme.ArbitrumTheme;
  } else if (isThemeBalancer) {
    theme = CssTheme.BalancerTheme;
  } else if (isThemeCompound) {
    theme = CssTheme.CompoundTheme;
  } else if (isThemeFuse) {
    theme = CssTheme.FuseTheme;
  } else if (isThemeKleros) {
    theme = CssTheme.KlerosTheme;
  } else if (isThemeDoDAO) {
    theme = CssTheme.GlobalTheme;
  } else if (isOptimismTheme) {
    theme = CssTheme.OptimismTheme;
  } else if (isThemeUniswap) {
    theme = CssTheme.UniswapTheme;
  }

  const themeValue = themes[theme];

  const style = {
    '--primary-color': themeValue.primaryColor,
    '--bg-color': themeValue.bgColor,
    '--text-color': themeValue.textColor,
    '--link-color': themeValue.linkColor,
    '--heading-color': themeValue.headingColor,
    '--border-color': themeValue.borderColor,
    '--header-bg': themeValue.headerBg,
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
