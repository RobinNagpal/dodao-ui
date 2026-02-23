'use client';

import { LoginSignupByEmailRequestBody, LoginSignupByEmailResponse } from '@/app/api/auth/custom-email/login-signup-by-email/route';
import { EmailSentMessage } from '@/components/login/email-sent-message';
import { UserLogin } from '@/components/login/user-login';
import { deleteSimulationSessionInfo } from '@/utils/auth-utils';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { CardContent } from '@/components/ui/card';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useEffect, useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import { Session } from '@dodao/web-core/types/auth/Session';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1 for login form, 2 for email sent message

  // Initialize usePostData hook for email login
  const { postData: postLogin, loading: loginLoading } = usePostData<LoginSignupByEmailResponse, LoginSignupByEmailRequestBody>({
    errorMessage: 'Failed to send login email. Please try again.',
  });

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      const response = await postLogin(`/api/auth/custom-email/login-signup-by-email`, {
        email: submittedEmail,
        spaceId: KoalaGainsSpaceId,
        context: Contexts.loginAndRedirectToHome,
      });

      if (response?.isTestUser && response.url) {
        window.location.href = response.url;
        return null;
      } else if (response) {
        setEmail(submittedEmail);
        setStep(2);
        return null;
      }
      return 'Error sending login email. Please try again.';
    } catch (err) {
      console.error(err);
      return 'Error sending login email. Please try again.';
    }
  };

  const handleSignInCodeSubmit = async (submittedEmail: string, code: string) => {
    try {
      const result = await signIn('sign-in-code', {
        email: submittedEmail,
        code: code,
        spaceId: KoalaGainsSpaceId,
        redirect: false,
      });

      if (result?.error) {
        return 'Invalid sign-in code or email. Please check and try again.';
      }

      if (result?.ok) {
        // Get session and store token in localStorage (same as email login flow)
        const session = (await getSession()) as Session | undefined;
        setDoDAOTokenInLocalStorage(session);

        // Redirect to home page on successful sign-in
        window.location.href = '/';
        return null;
      }

      return 'Error signing in with code. Please try again.';
    } catch (err) {
      console.error(err);
      return 'Error signing in with code. Please try again.';
    }
  };

  const handleUseAnotherEmail = () => {
    setStep(1);
  };

  useEffect(() => {
    deleteSimulationSessionInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 ? (
        <UserLogin onEmailLogin={handleEmailSubmit} onSignInCodeLogin={handleSignInCodeSubmit} />
      ) : (
        <CardContent>
          <EmailSentMessage email={email} onChangeEmail={handleUseAnotherEmail} />
        </CardContent>
      )}
    </div>
  );
}
