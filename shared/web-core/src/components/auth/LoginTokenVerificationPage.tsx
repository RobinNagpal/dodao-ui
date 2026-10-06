'use client';

import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { getSafeCallbackPath, LOGIN_CALLBACK_PATH_QUERY_PARAM } from '@dodao/web-core/utils/auth/safeCallbackPath';
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
    allParams: Object.fromEntries([...searchParams.entries()]),
  });

  useEffect(() => {
    console.log('[LoginTokenVerificationPage] useEffect triggered');
    console.log('[LoginTokenVerificationPage] searchParams in useEffect:', Object.fromEntries([...searchParams.entries()]));

    async function handleSignIn() {
      console.log('[LoginTokenVerificationPage] handleSignIn function started');

      // A same-origin path carried through the email link (the page the user
      // started the login from) wins; otherwise fall back to the context's page.
      // Apps that never put the param in their links keep the context mapping.
      const callbackPath = getSafeCallbackPath(searchParams.get(LOGIN_CALLBACK_PATH_QUERY_PARAM));
      const callbackUrl = callbackPath ?? contextToUrlMapping[context as Contexts];
      console.log('[LoginTokenVerificationPage] Determined callbackUrl:', { context, callbackPath, callbackUrl });

      // Back to /login with the error, keeping the page to return to so a retry still lands there.
      const loginErrorPath = (message: string): string => {
        const params = new URLSearchParams({ error: message });
        if (callbackPath) {
          params.set(LOGIN_CALLBACK_PATH_QUERY_PARAM, callbackPath);
        }
        return `/login?${params.toString()}`;
      };

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
            spaceId: space.id,
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
            console.error('[LoginTokenVerificationPage] Failed to sign in', result);
            console.log('[LoginTokenVerificationPage] Sign-in failed with result:', {
              ok: result?.ok,
              url: result?.url,
              error: result?.error,
            });
            console.log('[LoginTokenVerificationPage] Redirecting to login page with error');
            push(loginErrorPath('This login link has expired or was already used. Please request a new login email.'));
          }
        } catch (error) {
          console.error('[LoginTokenVerificationPage] Exception during sign-in process:', error);
          push(loginErrorPath('An error occurred during sign-in. Please try again.'));
        }
      } else {
        console.log('[LoginTokenVerificationPage] No token found in URL, cannot proceed with authentication');
        push(loginErrorPath('No login token found. Please request a new login email.'));
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
