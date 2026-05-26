'use client';

import NextAuthErrorCapture from '@dodao/web-core/ui/auth/NextAuthErrorCapture';
import { SessionProvider } from 'next-auth/react';

const Session = ({ children }: any) => {
  return (
    <SessionProvider>
      <NextAuthErrorCapture />
      {children}
    </SessionProvider>
  );
};

export default Session;
