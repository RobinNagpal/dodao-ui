'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from './login/page';
import { isLoggedIn } from '@/lib/auth';

export default function Page() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace('/alerts');
    } else {
      setReady(true);
    }
  }, [router]);

  // avoid flicker while we check localStorage
  if (!ready) return null;

  return <LoginPage />;
}
