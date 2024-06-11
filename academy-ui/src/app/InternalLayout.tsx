'use client';
import { ChildLayout } from '@/components/layout/ChildLayout';
import { InternalLayoutProps } from '@/components/layout/InternalLayoutProps';

import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { SpaceProvider } from '@dodao/web-core/ui/contexts/SpaceContext';
import StyledComponentsRegistry from '@dodao/web-core/utils/StyledComponentsRegistry';
import './globals.scss';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

export default function InternalLayout({ children, session, space, spaceError }: InternalLayoutProps) {
  return (
    <StyledComponentsRegistry>
      <SpaceProvider>
        <NotificationProvider>
          <ChildLayout session={session} space={space} spaceError={spaceError}>
            {children}
          </ChildLayout>
        </NotificationProvider>
      </SpaceProvider>
    </StyledComponentsRegistry>
  );
}
