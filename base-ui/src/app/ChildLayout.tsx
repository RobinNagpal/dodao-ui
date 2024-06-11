"use client";

import ErrorPage from "@dodao/web-core/components/app/ErrorPage";
import { InternalLayoutProps } from "@dodao/web-core/components/layout/InternalLayoutProps";
import { NotificationWrapper } from "@dodao/web-core/components/layout/NotificationWrapper";
import { useSpace } from "@dodao/web-core/ui/contexts/SpaceContext";
import Web3ReactProviderWrapper from "@dodao/web-core/ui/contexts/Web3ReactContext";
import { UserIdKey } from "@dodao/web-core/types/auth/User";
import { getGTagId } from "@dodao/web-core/utils/analytics/getGTagId";
import { useNavigationEvent } from "@dodao/web-core/utils/analytics/useNavigationEvent";
import { getAuthenticatedApolloClient } from "@dodao/web-core/utils/apolloClient";
import { setDoDAOTokenInLocalStorage } from "@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage";
import { ApolloProvider } from "@apollo/client";
import { SessionProvider } from "next-auth/react";
import { useEffect, useMemo, ReactNode } from "react";
import ReactGA from "react-ga4";
import LoginModal from "@dodao/web-core/components/auth/LoginModal";
import FullPageLoader from "@dodao/web-core/components/core/loaders/FullPageLoading";
import TopNav from "@/components/main/TopNav/TopNav";
import { LoginModalProvider } from "@dodao/web-core/ui/contexts/LoginModalContext";
import { SpaceWithIntegrationsFragment } from "@dodao/web-core/types/space";
import styled from "styled-components";

const StyledMain = styled.main`
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: calc(100vh - 64px);
`;

function PageTopNav(props: { space: SpaceWithIntegrationsFragment }) {
  return <TopNav space={props.space} />;
}

function PageFooter(props: { space: SpaceWithIntegrationsFragment }) {
  //Checking if the url contains embedded-tidbit-collections
  if (typeof window !== "undefined") {
    const currentUrl = window.location.href;
    if (currentUrl.includes("embedded-tidbit-collections")) {
      return null;
    }
  }
  return <div>Footer</div>;
}

export function ChildLayout({
  children,
  session,
  space,
  spaceError,
}: InternalLayoutProps) {
  const client = useMemo(
    () => getAuthenticatedApolloClient(session),
    [session]
  );

  const { setSpace } = useSpace();

  useEffect(() => {
    if (space) {
      setSpace(space);
      ReactGA.initialize(getGTagId(space));
    }
  }, [space]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (session?.userId) {
        localStorage.setItem(UserIdKey, session?.userId);
        setDoDAOTokenInLocalStorage(session);
      } else {
        localStorage.setItem(UserIdKey, "anonymous");
      }
    }
  }, [session]);

  useNavigationEvent((url: string) => {
    console.log("page_view", url);
    ReactGA.event("page_view", {
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
            <LoginModal />
            <PageTopNav space={space!} />
            <StyledMain>{children}</StyledMain>
            <PageFooter space={space!} />
          </LoginModalProvider>
        </SessionProvider>
        <NotificationWrapper />
      </ApolloProvider>
    </Web3ReactProviderWrapper>
  );
}
