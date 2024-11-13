'use client';

import { Session } from '@dodao/web-core/types/auth/Session';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getSession, signIn, useSession } from 'next-auth/react';

interface CallbackPageProps {
  space: WebCoreSpace;
  callbackUrl?: string;
}

const CallbackPage = ({ space, callbackUrl }: CallbackPageProps) => {
  const { push } = useRouter();
  const { status } = useSession();

  const searchParams = useSearchParams();
  useEffect(() => {
    async function handleSignIn() {
      // Ensure we have the token and only try to sign in if not already signed in
      const token = searchParams.get('token');
      if (token) {
        // Attempt to sign in
        const result = await signIn('custom-email', {
          redirect: false, // Prevent NextAuth from automatically redirecting
          token,
          callbackUrl,
          spaceId: space.id,
        });

        // Redirect to the home page or custom callback URL on success
        if (result?.url && result?.ok && callbackUrl) {
          const session = (await getSession()) as Session | undefined;
          setDoDAOTokenInLocalStorage(session);
          push(callbackUrl);
        } else {
          // Handle sign-in failure (e.g., invalid token) as needed
          console.error('Failed to sign in', result);
          // Redirect to an error page or display an error message
        }
      }
    }

    handleSignIn();
  }, [status, push]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <PageWrapper>
      <FullPageLoader />
    </PageWrapper>
  );
};

export default CallbackPage;
