'use client';
import LoginModal from '@/components/auth/LoginModal';
import MainContainer from '@/components/main/Container/MainContainer';
import TopNav from '@/components/main/TopNav/TopNav';
import AaveTheme from '@/components/themes/AaveTheme';
import CompoundTheme from '@/components/themes/CompoundTheme';
import GlobalTheme from '@/components/themes/GlobalTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import { LoginModalProvider } from '@/context/LoginModalContext';
import Web3ReactProviderWrapper from '@/context/web3ReactProvider';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import './globals.css';
import styled from 'styled-components';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

function ThemeComponent() {
  const isThemeCompound = false;
  const isThemeAave = false;
  const isThemeUniswap = true;

  if (isThemeCompound) return <CompoundTheme />;
  if (isThemeAave) return <AaveTheme />;
  if (isThemeUniswap) return <UniswapTheme />;
  return <GlobalTheme />;
}

const StyledMain = styled.main`
  background-color: var(--bg-color);
  color: var(--text-color);
`;

export default function InternalLayout({ children, session }: InternalLayoutProps) {
  return (
    <Web3ReactProviderWrapper>
      <SessionProvider session={session}>
        <ThemeComponent />
        <LoginModalProvider>
          <LoginModal />
          <TopNav />
          <StyledMain className="h-max">
            <MainContainer>{children}</MainContainer>
          </StyledMain>
        </LoginModalProvider>
      </SessionProvider>
    </Web3ReactProviderWrapper>
  );
}
