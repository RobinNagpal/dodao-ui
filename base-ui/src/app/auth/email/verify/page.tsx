'use client';

import withSpace, { SpaceProps } from '@/contexts/withSpace';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';

const CallbackPage = ({ space }: SpaceProps) => {
  const { push } = useRouter();
  const { status } = useSession();

  const { get } = useSearchParams();
  useEffect(() => {
    async function handleSignIn() {
      // Ensure we have the token and only try to sign in if not already signed in
      const token = get('token');
      if (token && status !== 'authenticated') {
        // Attempt to sign in
        const result = await signIn('custom-email', {
          redirect: false, // Prevent NextAuth from automatically redirecting
          token,
          callbackUrl: '/homepage',
          spaceId: space.id,
        });

        // const session = (await getSession()) as Session | undefined;
        // setDoDAOTokenInLocalStorage(session);
        // Redirect to the home page or custom callback URL on success
        if (result?.url) {
          push(result.url);
        } else {
          // Handle sign-in failure (e.g., invalid token) as needed
          console.error('Failed to sign in');
          // Redirect to an error page or display an error message
        }
      }
    }

    handleSignIn();
  }, [status, push]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Optionally, redirect authenticated users or show a message
  if (status === 'authenticated') {
    push('/homepage'); // Redirect to home or another page
    return null; // Or a "You are already signed in" message
  }

  return (
    <PageWrapper>
      <FullPageLoader />
    </PageWrapper>
  );
};

export default withSpace(CallbackPage);
