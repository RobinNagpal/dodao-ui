'use client';

import ErrorPage from '@/components/app/ErrorPage';
import { BasePage } from '@/components/layout/BasePage';
import { InternalLayoutProps } from '@/components/layout/InternalLayoutProps';
import { NotificationWrapper } from '@/components/layout/NotificationWrapper';
import { useSpace } from '@/contexts/SpaceContext';
import Web3ReactProviderWrapper from '@/contexts/Web3ReactContext';
import { UserIdKey } from '@/types/auth/User';
import { getGTagId } from '@/utils/analytics/getGTagId';
import { useNavigationEvent } from '@/utils/analytics/useNavigationEvent';
import { getAuthenticatedApolloClient } from '@/utils/apolloClient';
import { setDoDAOTokenInLocalStorage } from '@/utils/auth/setDoDAOTokenInLocalStorage';
import { ApolloProvider } from '@apollo/client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import ReactGA from 'react-ga4';

export function ChildLayout({ children, session, space, spaceError }: InternalLayoutProps) {
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
          <BasePage space={space}>{children}</BasePage>
        </SessionProvider>
        <NotificationWrapper />
      </ApolloProvider>
    </Web3ReactProviderWrapper>
  );
}
