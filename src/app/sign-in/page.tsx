'use client';

import { LoginButtons } from '@/app/login/components/LoginButtons';
import FullPageLoader from '@/components/core/loaders/FullPageLoading';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SignIn() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  useEffect(() => {
    if (!loading && session) window.close();
  }, [session, loading]);

  if (loading && !session) {
    return <FullPageLoader />;
  }
  if (!loading && !session) {
    return <LoginButtons />;
  }
  return null;
}
