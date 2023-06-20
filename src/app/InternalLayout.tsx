'use client';
import LoginModal from '@/components/auth/LoginModal';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import Notification from '@/components/core/notify/Notification';
import MainContainer from '@/components/main/Container/MainContainer';
import TopNav from '@/components/main/TopNav/TopNav';
import AaveTheme from '@/components/themes/AaveTheme';
import CompoundTheme from '@/components/themes/CompoundTheme';
import GlobalTheme from '@/components/themes/GlobalTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import { LoginModalProvider } from '@/contexts/LoginModalContext';

import { NotificationProvider, useNotificationContext } from '@/contexts/NotificationContext';
import { SpaceProvider, useSpace } from '@/contexts/SpaceContext';
import Web3ReactProviderWrapper from '@/contexts/Web3ReactContext';
import { useExtendedSpaceByDomainQuery } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { getAuthenticatedApolloClient } from '@/utils/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import 'src/app/globals.scss';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

function ThemeComponent() {
  const isThemeCompound = false;
  const isThemeAave = true;
  const isThemeUniswap = false;
  const { space } = useSpace();
  if (space?.id === 'uniswap-eth-1') {
    return <UniswapTheme />;
  }
  if (isThemeCompound) return <CompoundTheme />;
  if (isThemeAave) return <AaveTheme />;
  if (isThemeUniswap) return <UniswapTheme />;
  return (
    <div>
      <h3>{(space && JSON.stringify(space)) || 'No No No'}</h3>
      <GlobalTheme />
    </div>
  );
}

const NotificationWrapper = () => {
  const { notification, hideNotification } = useNotificationContext();

  if (!notification) return null;

  const key = `${notification.heading}_${notification.type}_${notification.duration}_${Date.now()}`;

  return (
    <Notification
      key={key}
      type={notification.type}
      duration={notification.duration}
      heading={notification.heading}
      message={notification.message}
      onClose={hideNotification}
    />
  );
};

const StyledMain = styled.main`
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
`;

function ChildLayout({ children, session }: InternalLayoutProps) {
  const origin = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '';
  const client = useMemo(() => getAuthenticatedApolloClient(session), [session]);
  const { data } = useExtendedSpaceByDomainQuery({
    client,
    variables: { domain: origin },
    errorPolicy: 'all',
  });

  const { setSpace } = useSpace();

  useEffect(() => {
    if (data?.space) {
      setSpace(data.space);
    }
  }, [data, setSpace]);

  return (
    <Web3ReactProviderWrapper>
      <ApolloProvider client={client}>
        <SessionProvider session={session}>
          <ThemeComponent />
          {data?.space?.id ? (
            <LoginModalProvider>
              <LoginModal />
              <TopNav />
              <StyledMain>{children}</StyledMain>
            </LoginModalProvider>
          ) : (
            <FullPageLoader />
          )}
        </SessionProvider>
        <NotificationWrapper />
      </ApolloProvider>
    </Web3ReactProviderWrapper>
  );
}

export default function InternalLayout({ children, session }: InternalLayoutProps) {
  return (
    <SpaceProvider>
      <NotificationProvider>
        <ChildLayout session={session}>{children}</ChildLayout>
      </NotificationProvider>
    </SpaceProvider>
  );
}
