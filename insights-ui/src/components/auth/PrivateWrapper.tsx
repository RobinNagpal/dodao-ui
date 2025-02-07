'use client';

import { isAdmin } from '@/util/auth/isAdmin';
import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyAdminProps {
  children: ReactNode;
}

export default function PrivateWrapper({ children }: ClientOnlyAdminProps) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  return admin ? <>{children}</> : null;
}
