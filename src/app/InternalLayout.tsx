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
import KlerosTheme from '@/components/themes/KlerosTheme';
import OptimismTheme from '@/components/themes/OptimismTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import { LoginModalProvider } from '@/contexts/LoginModalContext';

import { NotificationProvider, useNotificationContext } from '@/contexts/NotificationContext';
import { SpaceProvider, useSpace } from '@/contexts/SpaceContext';
import Web3ReactProviderWrapper from '@/contexts/Web3ReactContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { UserIdKey } from '@/types/auth/User';
import { Themes } from '@/types/deprecated/models/enums';
import { getGTagId } from '@/utils/analytics/getGTagId';
import { useNavigationEvent } from '@/utils/analytics/useNavigationEvent';
import { getAuthenticatedApolloClient } from '@/utils/apolloClient';
import { setDoDAOTokenInLocalStorage } from '@/utils/auth/setDoDAOTokenInLocalStorage';
import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import 'src/app/globals.scss';
import styled from 'styled-components';
import ReactGA from 'react-ga4';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

interface InternalLayoutProps {
  children: React.ReactNode;
  session: Session | null;
  space?: SpaceWithIntegrationsFragment | null;
  spaceError: boolean;
}

function ThemeComponent() {
  const { space } = useSpace();
  const isThemeCompound = space?.skin === Themes.Compound;
  const isThemeAave = space?.skin === Themes.Aave;
  const isThemeUniswap = space?.skin === Themes.Uniswap;
  const isThemeDoDAO = space?.skin === Themes.DoDAO;
  const isThemeFuse = space?.skin === Themes.Fuse;
  const isThemeBalancer = space?.skin === Themes.Balancer;
  const isThemeKleros = space?.skin === Themes.Kleros;
  const isOptimismTheme = space?.skin === Themes.Optimism;

  if (space?.id === 'uniswap-eth-1') {
    return <UniswapTheme />;
  }
  if (isThemeCompound) return <CompoundTheme />;
  if (isThemeAave) return <AaveTheme />;
  if (isThemeUniswap) return <UniswapTheme />;
  if (isThemeFuse) return <FuseTheme />;
  if (isThemeBalancer) return <BalancerTheme />;
  if (isThemeKleros) return <KlerosTheme />;
  if (isOptimismTheme) return <OptimismTheme />;
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
  min-height: calc(100vh - 64px);
`;

function BasePage(props: { space?: SpaceWithIntegrationsFragment | null; children: React.ReactNode }) {
  const isBotSite = props.space?.botDomains?.includes(window.location.hostname);
  if (props.space?.id) {
    return (
      <LoginModalProvider>
        <LoginModal />
        {!isBotSite ? <TopNav /> : null}
        <StyledMain>{props.children}</StyledMain>
      </LoginModalProvider>
    );
  }
  return <FullPageLoader />;
}

function ChildLayout({ children, session, space, spaceError }: InternalLayoutProps) {
  const client = useMemo(() => getAuthenticatedApolloClient(session), [session]);

  const { setSpace } = useSpace();

  useEffect(() => {
    if (space) {
      setSpace(space);
      ReactGA.initialize(getGTagId(space));
    }
  }, [space]);

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

  useNavigationEvent((url: string) => {
    console.log('page_view', url);
    ReactGA.event('page_view', {
      page_title: url,
      page_location: url,
    });
  });

  if (spaceError) {
    return <ErrorPage />;
  }

  return (
    <Web3ReactProviderWrapper>
      <ApolloProvider client={client}>
        <SessionProvider session={session}>
          <ThemeComponent />
          <BasePage space={space}>{children}</BasePage>
        </SessionProvider>
        <NotificationWrapper />
      </ApolloProvider>
    </Web3ReactProviderWrapper>
  );
}

export default function InternalLayout({ children, session, space, spaceError }: InternalLayoutProps) {
  return (
    <SpaceProvider>
      <NotificationProvider>
        <ChildLayout session={session} space={space} spaceError={spaceError}>
          {children}
        </ChildLayout>
      </NotificationProvider>
    </SpaceProvider>
  );
}
