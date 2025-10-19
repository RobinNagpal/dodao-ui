'use client';

import { KoalaGainsSession } from '@/types/auth';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

interface ClientOnlyAdminProps {
  children: ReactNode;
  session?: KoalaGainsSession;
}

export default function PrivateWrapper({ children, session: serverSession }: ClientOnlyAdminProps) {
  const { data: koalaSession } = useSession();

  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  let isAdmin = session?.role === 'Admin' || serverSession?.role === 'Admin' || false;

  useEffect(() => {
    isAdmin = session?.role === 'Admin' || serverSession?.role === 'Admin' || false;
  }, [koalaSession]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
