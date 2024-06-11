'use client';

import { SessionProvider } from 'next-auth/react';

const Session = ({ children }: any) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Session;
