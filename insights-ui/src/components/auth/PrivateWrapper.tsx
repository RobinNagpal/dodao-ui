'use client';

import { KoalaGainsSession } from '@/types/auth';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

interface ClientOnlyAdminProps {
  children: ReactNode;
}

export default function PrivateWrapper({ children }: ClientOnlyAdminProps) {
  const { data: koalaSession } = useSession();

  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  let isAdmin = session?.role === 'Admin';

  useEffect(() => {
    isAdmin = session?.role === 'Admin';
  }, [koalaSession]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
