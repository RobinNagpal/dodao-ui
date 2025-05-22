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
  console.log('[LoginTokenVerificationPage] Component initialized with space:', space);
  const { push } = useRouter();
  console.log('[LoginTokenVerificationPage] Router initialized');

  const searchParams = useSearchParams();
  const context = searchParams.get('context');
  console.log('[LoginTokenVerificationPage] Search params retrieved:', { 
    context, 
    allParams: Object.fromEntries([...searchParams.entries()]) 
  });

  useEffect(() => {
    console.log('[LoginTokenVerificationPage] useEffect triggered');
    console.log('[LoginTokenVerificationPage] searchParams in useEffect:', Object.fromEntries([...searchParams.entries()]));

    async function handleSignIn() {
      console.log('[LoginTokenVerificationPage] handleSignIn function started');

      // Conditionally set the callback URL based on the context
      const callbackUrl = contextToUrlMapping[context as Contexts];
      console.log('[LoginTokenVerificationPage] Determined callbackUrl from context:', { context, callbackUrl });

      const full = document.location.protocol + '//' + document.location.host;
      const fullCallbackUrl = full + callbackUrl;
      console.log('[LoginTokenVerificationPage] Constructed fullCallbackUrl:', fullCallbackUrl);

      // Ensure we have the token and only try to sign in if not already signed in
      const token = searchParams.get('token');
      console.log('[LoginTokenVerificationPage] Retrieved token from searchParams:', token ? 'Token exists' : 'No token found');

      if (token) {
        console.log('[LoginTokenVerificationPage] Attempting to sign in with token');
        // Attempt to sign in
        try {
          console.log('[LoginTokenVerificationPage] Calling signIn with params:', { 
            provider: 'custom-email', 
            redirect: false,
            callbackUrl: fullCallbackUrl,
            spaceId: space.id
          });

          const result = await signIn('custom-email', {
            redirect: false, // Prevent NextAuth from automatically redirecting
            token,
            callbackUrl: fullCallbackUrl,
            spaceId: space.id,
          });

          console.log('[LoginTokenVerificationPage] signIn result:', result);

          // Redirect to the home page or custom callback URL on success
          if (result?.url && result?.ok && fullCallbackUrl) {
            console.log('[LoginTokenVerificationPage] Sign-in successful, getting session');
            const session = (await getSession()) as Session | undefined;
            console.log('[LoginTokenVerificationPage] Session retrieved:', session ? 'Session exists' : 'No session found');

            console.log('[LoginTokenVerificationPage] Setting DoDAO token in localStorage');
            setDoDAOTokenInLocalStorage(session);

            console.log('[LoginTokenVerificationPage] Redirecting to:', fullCallbackUrl);
            push(fullCallbackUrl);
          } else {
            // Handle sign-in failure (e.g., invalid token) as needed
            console.error('[LoginTokenVerificationPage] Failed to sign in', result);
            console.log('[LoginTokenVerificationPage] Sign-in failed with result:', { 
              ok: result?.ok, 
              url: result?.url, 
              error: result?.error 
            });
            // Redirect to an error page or display an error message
          }
        } catch (error) {
          console.error('[LoginTokenVerificationPage] Exception during sign-in process:', error);
        }
      } else {
        console.log('[LoginTokenVerificationPage] No token found in URL, cannot proceed with authentication');
      }
    }

    if (typeof window !== 'undefined') {
      console.log('[LoginTokenVerificationPage] Window is defined, calling handleSignIn');
      handleSignIn();
    } else {
      console.log('[LoginTokenVerificationPage] Window is undefined, skipping handleSignIn');
    }
  }, []);

  return (
    <PageWrapper>
      <FullPageLoader />
    </PageWrapper>
  );
}
