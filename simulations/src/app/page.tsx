'use client';

import { UserResponse } from '@/app/api/auth/user/route';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DoDAOSession } from '@dodao/web-core/types/auth/Session';

export default function Home() {
  const { data } = useSession();
  const session = data as DoDAOSession;
  const baseUrl = getBaseUrl();
  const router = useRouter();

  console.log('session', session);

  const { data: userResponse, reFetchData } = useFetchData<UserResponse>(
    `${getBaseUrl()}/api/auth/user`,
    { skipInitialFetch: true },
    'Failed to fetch user data'
  );

  const showHomeScreen = async () => {
    const resp = await reFetchData();
    console.log('userResponse', userResponse);
    console.log('resp', resp);

    if (resp) {
      if (resp.role === 'Student') {
        router.push('/student');
      } else if (resp.role === 'Instructor') {
        router.push('/instructor');
      } else if (resp.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    }
  };
  useEffect(() => {
    console.log('data', data);
    if (!data) {
      router.push('/login');
    } else {
      showHomeScreen();
    }
  }, [data, router, showHomeScreen]);

  // Show loading while checking localStorage and redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
