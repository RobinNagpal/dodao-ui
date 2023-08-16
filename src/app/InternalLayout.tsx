'use client';
import ErrorPage from '@/components/app/ErrorPage';
import LoginModal from '@/components/auth/LoginModal';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import Notification from '@/components/core/notify/Notification';
import TopNav from '@/components/main/TopNav/TopNav';
import AaveTheme from '@/components/themes/AaveTheme';
import BalancerTheme from '@/components/themes/BalancerTheme';
import CompoundTheme from '@/components/themes/CompoundTheme';
import FuseTheme from '@/components/themes/FuseTheme';
import GlobalTheme from '@/components/themes/GlobalTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import { LoginModalProvider } from '@/contexts/LoginModalContext';

import { NotificationProvider, useNotificationContext } from '@/contexts/NotificationContext';
import { SpaceProvider, useSpace } from '@/contexts/SpaceContext';
import Web3ReactProviderWrapper from '@/contexts/Web3ReactContext';
import { ExtendedSpaceByDomainQuery, useExtendedSpaceByDomainQuery } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { UserIdKey } from '@/types/auth/User';
import { Themes } from '@/types/deprecated/models/enums';
import { getAuthenticatedApolloClient } from '@/utils/apolloClient';
import { setDoDAOTokenInLocalStorage } from '@/utils/auth/setDoDAOTokenInLocalStorage';
import { ApolloError, ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import 'src/app/globals.scss';
import styled from 'styled-components';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

function ThemeComponent() {
  const { space } = useSpace();
  const isThemeCompound = space?.skin === Themes.Compound;
  const isThemeAave = space?.skin === Themes.Aave;
  const isThemeUniswap = space?.skin === Themes.Uniswap;
  const isThemeDoDAO = space?.skin === Themes.DoDAO;
  const isThemeFuse = space?.skin === Themes.Fuse;
  const isThemeBalancer = space?.skin === Themes.Balancer;

  if (space?.id === 'uniswap-eth-1') {
    return <UniswapTheme />;
  }
  if (isThemeCompound) return <CompoundTheme />;
  if (isThemeAave) return <AaveTheme />;
  if (isThemeUniswap) return <UniswapTheme />;
  if (isThemeFuse) return <FuseTheme />;
  if (isThemeBalancer) return <BalancerTheme />;
  if (isThemeDoDAO) return <GlobalTheme />;
  return (
    <div>
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

function BasePage(props: { data?: ExtendedSpaceByDomainQuery; error?: ApolloError; children: React.ReactNode }) {
  if (props.data?.space?.id) {
    return (
      <LoginModalProvider>
        <LoginModal />
        <TopNav />
        <StyledMain>{props.children}</StyledMain>
      </LoginModalProvider>
    );
  } else if (props.error?.clientErrors || props.error?.graphQLErrors || props.error?.networkError) {
    return <ErrorPage />;
  }
  return <FullPageLoader />;
}

function ChildLayout({ children, session }: InternalLayoutProps) {
  const origin = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '';
  const client = useMemo(() => getAuthenticatedApolloClient(session), [session]);
  const { data, error } = useExtendedSpaceByDomainQuery({
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (session?.userId) {
        localStorage.setItem(UserIdKey, session?.userId);
        setDoDAOTokenInLocalStorage(session);
      } else {
        localStorage.setItem(UserIdKey, 'anonymous');
      }
    }
  }, [session]);

  return (
    <Web3ReactProviderWrapper>
      <ApolloProvider client={client}>
        <SessionProvider session={session}>
          <ThemeComponent />
          <BasePage data={data} error={error}>
            {children}
          </BasePage>
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
