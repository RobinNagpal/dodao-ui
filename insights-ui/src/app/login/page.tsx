'use client';

import { EmailSentMessage } from '@/components/login/email-sent-message';
import { UserLogin } from '@/components/login/user-login';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useState } from 'react';

// Define types for login request and response
interface LoginRequest {
  email: string;
  spaceId: string;
  context: string;
}

interface LoginResponse {
  userId: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');

  const [step, setStep] = useState<1 | 2>(1); // 1 for email form, 2 for email sent message

  // Initialize usePostData hook for login
  const { postData: postLogin, loading: loginLoading } = usePostData<LoginResponse, LoginRequest>({
    errorMessage: 'Failed to send login email. Please try again.',
  });

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      const response = await postLogin(`/api/auth/custom-email/login-signup-by-email`, {
        email: submittedEmail,
        spaceId: KoalaGainsSpaceId,
        context: Contexts.loginAndRedirectToHome,
      });

      if (response) {
        localStorage.setItem('email', submittedEmail);
        localStorage.setItem('userId', response.userId);
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

  const handleUseAnotherEmail = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setStep(1);
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="w-full max-w-md">
          {step === 1 ? <UserLogin onLogin={handleEmailSubmit} /> : <EmailSentMessage email={email} onChangeEmail={handleUseAnotherEmail} />}
        </div>
      </div>
    </PageWrapper>
  );
}
