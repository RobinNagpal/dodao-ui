'use client';

import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface CallbackPageProps {
  space: WebCoreSpace;
  callbackUrl?: string;
}

const contextToUrlMapping: { [key in Contexts]: string } = {
  [Contexts.finishSetup]: '/spaces/finish-space-setup',
  [Contexts.loginAndGoToSpaces]: '/spaces/space-collections',
  [Contexts.setupNewSpace]: '/spaces/create',
  [Contexts.loginAndRedirectToHome]: '/',
};

export default function LoginTokenVerificationPage({ space }: CallbackPageProps) {
  const { push } = useRouter();

  const searchParams = useSearchParams();
  const context = searchParams.get('context');

  useEffect(() => {
    console.log('searchParams in useEffect', searchParams);

    async function handleSignIn() {
      // Conditionally set the callback URL based on the context
      const callbackUrl = contextToUrlMapping[context as Contexts];

      const full = document.location.protocol + '//' + document.location.host;
      const fullCallbackUrl = full + callbackUrl;

      // Ensure we have the token and only try to sign in if not already signed in
      const token = searchParams.get('token');
      if (token) {
        // Attempt to sign in
        const result = await signIn('custom-email', {
          redirect: false, // Prevent NextAuth from automatically redirecting
          token,
          callbackUrl: fullCallbackUrl,
          spaceId: space.id,
        });

        // Redirect to the home page or custom callback URL on success
        if (result?.url && result?.ok && fullCallbackUrl) {
          const session = (await getSession()) as Session | undefined;
          setDoDAOTokenInLocalStorage(session);
          push(fullCallbackUrl);
        } else {
          // Handle sign-in failure (e.g., invalid token) as needed
          console.error('Failed to sign in', result);
          // Redirect to an error page or display an error message
        }
      }
    }

    if (typeof window !== 'undefined') {
      handleSignIn();
    }
  }, []);

  return (
    <PageWrapper>
      <FullPageLoader />
    </PageWrapper>
  );
}
