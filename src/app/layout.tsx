'use client';
import NavigationWrapper from '@/components/main/NavigationWrapper';
import AaveTheme from '@/components/themes/AaveTheme';
import CompoundTheme from '@/components/themes/CompoundTheme';
import GlobalTheme from '@/components/themes/GlobalTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import './globals.css';
import SessionProvider from '@/context/sessionProvider';
import Web3ReactProviderWrapper from '@/context/web3ReactProvider';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isThemeCompound = true;
  const isThemeAave = false;
  const isThemeUniswap = false;

  return (
    <Web3ReactProviderWrapper>
      <SessionProvider>
        <html lang="en" className="h-full">
          <body className="h-full">
            <GlobalTheme />
            {isThemeUniswap && <UniswapTheme />}
            {isThemeAave && <AaveTheme />}
            {isThemeCompound && <CompoundTheme />}
            <div className="flex">
              <div className="w-full">
                <NavigationWrapper>
                  <main className="w-full mt-16">{children}</main>
                </NavigationWrapper>
              </div>
            </div>
          </body>
        </html>
      </SessionProvider>
    </Web3ReactProviderWrapper>
  );
}
