'use client';

import TopNav from '@/components/main/TopNav/TopNav';
import { ApolloProvider } from '@apollo/client';
import ErrorPage from '@dodao/web-core/components/app/ErrorPage';
import LoginModal from '@dodao/web-core/components/auth/LoginModal';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { UserIdKey } from '@dodao/web-core/types/auth/User';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { LoginModalProvider } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { useSpace } from '@/contexts/SpaceContext';
import Web3ReactProviderWrapper from '@dodao/web-core/ui/contexts/Web3ReactContext';
import { getGTagId } from '@dodao/web-core/utils/analytics/getGTagId';
import { useNavigationEvent } from '@dodao/web-core/utils/analytics/useNavigationEvent';
import { getAuthenticatedApolloClient } from '@dodao/web-core/utils/apolloClient';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import { Space } from '@prisma/client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import ReactGA from 'react-ga4';
import styles from './ChildLayout.module.scss';
import { Footer } from '@/components/Footer/Footer';
function PageTopNav(props: { space: WebCoreSpace }) {
  return <TopNav space={props.space} />;
}

function PageFooter(props: { space: WebCoreSpace }) {
  return (
    <div>
      <Footer />
    </div>
  );
}

export function ChildLayout({
  children,
  session,
  space,
  spaceError,
}: {
  children: React.ReactNode;
  session: Session | null;
  space?: Space | null;
  spaceError: boolean;
}) {
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
          <LoginModalProvider>
            <LoginModal space={space!} />
            <PageTopNav space={space!} />
            <div className={styles.main}>{children}</div>
            <PageFooter space={space!} />
          </LoginModalProvider>
        </SessionProvider>
        <NotificationWrapper />
      </ApolloProvider>
    </Web3ReactProviderWrapper>
  );
}
