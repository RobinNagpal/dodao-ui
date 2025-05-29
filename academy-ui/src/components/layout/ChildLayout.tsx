'use client';

import { BasePage } from '@/components/layout/BasePage';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import ErrorPage from '@dodao/web-core/components/app/ErrorPage';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { UserIdKey } from '@dodao/web-core/types/auth/User';
import Web3ReactProviderWrapper from '@dodao/web-core/ui/contexts/Web3ReactContext';
import { getGTagId } from '@dodao/web-core/utils/analytics/getGTagId';
import { useNavigationEvent } from '@dodao/web-core/utils/analytics/useNavigationEvent';
import { getAuthenticatedApolloClient } from '@dodao/web-core/utils/apolloClient';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import CustomApolloProvider from 'defi-alerts/src/providers/ApolloProvider';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo } from 'react';
import ReactGA from 'react-ga4';

export function ChildLayout({
  children,
  session,
  space,
  spaceError,
}: {
  children: React.ReactNode;
  session: Session | null;
  space?: SpaceWithIntegrationsDto | null;
  spaceError: boolean;
}) {
  const client = useMemo(() => getAuthenticatedApolloClient(session), [session]);

  useEffect(() => {
    if (space && !ReactGA.isInitialized) {
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
      <SessionProvider session={session}>
        <CustomApolloProvider>
          <BasePage space={space!}>{children}</BasePage>
        </CustomApolloProvider>
      </SessionProvider>
      <NotificationWrapper />
    </Web3ReactProviderWrapper>
  );
}
