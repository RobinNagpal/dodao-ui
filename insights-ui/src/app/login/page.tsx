'use client';

import { EmailSentMessage } from '@/components/login/email-sent-message';
import { UserLogin } from '@/components/login/user-login';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { CardContent } from 'defi-alerts/src/components/ui/card';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
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
    <div className="min-h-screen bg-gray-50">
      {step === 1 ? (
        <UserLogin onLogin={handleEmailSubmit} />
      ) : (
        <CardContent>
          <EmailSentMessage email={email} onChangeEmail={handleUseAnotherEmail} />
        </CardContent>
      )}
    </div>
  );
}
