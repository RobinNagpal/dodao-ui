'use client';

import { KoalaGainsSession } from '@/types/auth';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface ClientOnlyAdminProps {
  children: ReactNode;
}

export default function PrivateWrapper({ children }: ClientOnlyAdminProps) {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const isAdmin = session?.role === 'Admin';
  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
