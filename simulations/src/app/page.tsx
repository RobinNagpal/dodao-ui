'use client';

import { UserResponse } from '@/app/api/auth/user/route';
import { SimulationSession } from '@/types/user';
import { logoutUSer } from '@/utils/auth-utils';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';

export default function Home() {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const router = useRouter();

  console.log('session', session);

  console.log('data', session);
  if (!session) {
    logoutUSer();
    router.push('/login');
  } else {
    if (session.role === 'Student') {
      router.push('/student');
    } else if (session.role === 'Instructor') {
      router.push('/instructor');
    } else if (session.role === 'Admin') {
      router.push('/admin');
    } else {
      logoutUSer();
      router.push('/login');
    }
  }

  // Show loading while checking localStorage and redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
