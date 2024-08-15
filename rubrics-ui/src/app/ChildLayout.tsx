'use client';

import { Footer } from '@/components/HomePage/components/Footer';
import TopNav from '@/components/main/TopNav/TopNav';
import { useSpace } from '@/contexts/SpaceContext';
import ErrorPage from '@dodao/web-core/components/app/ErrorPage';
import LoginModal from '@dodao/web-core/components/auth/LoginModal';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { UserIdKey } from '@dodao/web-core/types/auth/User';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { LoginModalProvider } from '@dodao/web-core/ui/contexts/LoginModalContext';
import Web3ReactProviderWrapper from '@dodao/web-core/ui/contexts/Web3ReactContext';
import { getGTagId } from '@dodao/web-core/utils/analytics/getGTagId';
import { useNavigationEvent } from '@dodao/web-core/utils/analytics/useNavigationEvent';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import { Space } from '@prisma/client';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import styles from './ChildLayout.module.scss';

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

export function ChildLayout({ children, session, space }: { children: React.ReactNode; session: Session | null; space: Space; spaceError: boolean }) {
  const { setSpace } = useSpace();

  useEffect(() => {
    if (space) {
      setSpace(space);
      ReactGA.initialize(getGTagId(space));
    }
  }, [space]);

  useEffect(() => {
    if (typeof window !== 'undefined' && session) {
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

  return (
    <Web3ReactProviderWrapper>
      <SessionProvider session={session}>
        <LoginModalProvider>
          <LoginModal space={space} />
          <PageTopNav space={space} />
          <div className={styles.main}>{children}</div>
          <PageFooter space={space!} />
        </LoginModalProvider>
      </SessionProvider>
      <NotificationWrapper />
    </Web3ReactProviderWrapper>
  );
}
