'use client';

import { TOP_CRYPTO_PROJECTS_SPACE_ID } from '@/chatbot/utils/app/constants';
import LoginModal from '@/components/auth/LoginModal';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import TopNav from '@/components/main/TopNav/TopNav';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';

const StyledMain = styled.main`
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: calc(100vh - 64px);
`;
export function BasePage(props: { space?: SpaceWithIntegrationsFragment | null; children: ReactNode }) {
  const [isBotSite, setIsBotSite] = useState(true);

  useEffect(() => {
    setIsBotSite(!!props.space?.botDomains?.includes?.(window.location.hostname));
  }, [props.space]);

  if (props.space?.id) {
    return (
      <LoginModalProvider>
        <LoginModal />
        {isBotSite || props.space.id === TOP_CRYPTO_PROJECTS_SPACE_ID ? null : <TopNav space={props.space} />}
        <StyledMain>{props.children}</StyledMain>
      </LoginModalProvider>
    );
  }
  return <FullPageLoader />;
}
