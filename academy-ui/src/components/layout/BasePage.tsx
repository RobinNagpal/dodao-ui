'use client';

import Footer from '@/components/layout/Footer';
import TopNav from '@/components/main/TopNav/TopNav';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import LoginModal from '@dodao/web-core/components/auth/LoginModal';
import { LoginModalProvider } from '@dodao/web-core/ui/contexts/LoginModalContext';
import React, { ReactNode } from 'react';

const mainStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)',
  minHeight: 'calc(100vh - 118px)',
};

function PageTopNav(props: { space: SpaceWithIntegrationsDto }) {
  //Checking if the url contains embedded-tidbit-collections
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;
    if (currentUrl.includes('embedded-tidbit-collections')) {
      return null;
    }
  }

  return <TopNav space={props.space} />;
}

function PageFooter(props: { space: SpaceWithIntegrationsDto }) {
  //Checking if the url contains embedded-tidbit-collections
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.href;
    if (currentUrl.includes('embedded-tidbit-collections')) {
      return null;
    }
  }
  return <Footer space={props.space} />;
}

export function BasePage(props: { space: SpaceWithIntegrationsDto; children: ReactNode }) {
  return (
    <LoginModalProvider>
      <LoginModal space={props.space} />
      <PageTopNav space={props.space} />
      <main style={mainStyle}>{props.children}</main>
      <PageFooter space={props.space} />
    </LoginModalProvider>
  );
}
