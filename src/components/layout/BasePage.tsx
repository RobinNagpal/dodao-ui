'use client';

import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import LoginModal from '@/components/auth/LoginModal';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import TopNav from '@/components/main/TopNav/TopNav';
import TopCryptoTopNav from '@/components/projects/Nav/TopCryptoTopNav';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import Footer from './Footer';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledMain = styled.main`
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: calc(100vh - 64px);
`;

function PageTopNav(props: { space: SpaceWithIntegrationsFragment }) {
  const [isBotSite, setIsBotSite] = useState(true);

  useEffect(() => {
    setIsBotSite(!!props.space?.botDomains?.includes?.(window.location.hostname));
  }, [props.space]);

  if (isBotSite) {
    return null;
  }

  if (props.space?.id === PredefinedSpaces.CRYPTO_GELATO) {
    return <TopCryptoTopNav space={props.space} />;
  }

  // check here if the url starts with /embedded-tidbit-collections
  return <TopNav space={props.space} />;
}

function PageFooter(props: { space: SpaceWithIntegrationsFragment }) {
  // check here if the url starts with /embedded-tidbit-collections
  return <Footer spaceType={props.space.type} />;
}
export function BasePage(props: { space: SpaceWithIntegrationsFragment | null; children: ReactNode }) {
  if (props.space?.id) {
    return (
      <LoginModalProvider>
        <LoginModal />
        <PageTopNav space={props.space} />
        <StyledMain>{props.children}</StyledMain>
        <PageFooter space={props.space} />
      </LoginModalProvider>
    );
  }
  return <FullPageLoader />;
}
