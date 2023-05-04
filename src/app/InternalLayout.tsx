'use client';
import TopNav from '@/components/main/TopNav/TopNav';
import AaveTheme from '@/components/themes/AaveTheme';
import CompoundTheme from '@/components/themes/CompoundTheme';
import GlobalTheme from '@/components/themes/GlobalTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import Web3ReactProviderWrapper from '@/context/web3ReactProvider';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function InternalLayout({ children, session }: InternalLayoutProps) {
  const isThemeCompound = true;
  const isThemeAave = false;
  const isThemeUniswap = false;

  return (
    <Web3ReactProviderWrapper>
      <SessionProvider session={session}>
        <GlobalTheme />
        {isThemeUniswap && <UniswapTheme />}
        {isThemeAave && <AaveTheme />}
        {isThemeCompound && <CompoundTheme />}
        <TopNav />
        <main className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</main>
      </SessionProvider>
    </Web3ReactProviderWrapper>
  );
}
