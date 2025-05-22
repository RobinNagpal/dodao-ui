'use client';

import { getAlertsSpaceIdClientSide } from '@/utils/getAlertsSpaceIdClientSide';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { EmailForm } from '@/components/login/email-form';
import { VerificationForm } from '@/components/login/verification-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define types for login request and response
interface LoginRequest {
  email: string;
  spaceId: string;
  context: string;
}

interface LoginResponse {
  userId: string;
}

// Define types for verification request and response
interface VerificationRequest {
  code: string;
  userId: string | null;
  spaceId: string;
}

interface VerificationResponse {
  success: boolean;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1 for email, 2 for code
  const router = useRouter();
  const baseUrl = getBaseUrl();

  // Initialize usePostData hook for login
  const { postData: postLogin, loading: loginLoading } = usePostData<LoginResponse, LoginRequest>({
    errorMessage: 'Failed to send verification code. Please try again.',
  });

  // Initialize usePostData hook for verification
  const { postData: postVerification, loading: verificationLoading } = usePostData<VerificationResponse, VerificationRequest>({
    errorMessage: 'Incorrect code. Please try again.',
    redirectPath: '/alerts',
  });

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      const spaceId = await getAlertsSpaceIdClientSide();
      const response = await postLogin(`/api/auth/custom-email/login-signup-by-email`, {
        email: submittedEmail,
        spaceId: spaceId,
        context: Contexts.loginAndRedirectToHome,
      });

      if (response) {
        localStorage.setItem('email', submittedEmail);
        localStorage.setItem('userId', response.userId);
        setEmail(submittedEmail);
        setStep(2);
        return null;
      }
      return 'Error sending verification code. Please try again.';
    } catch (err) {
      console.error(err);
      return 'Error sending verification code. Please try again.';
    }
  };

  const handleVerificationSubmit = async (verificationCode: string) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await postVerification(`${baseUrl}/api/verify`, {
        code: verificationCode,
        userId,
        spaceId: await getAlertsSpaceIdClientSide(),
      });

      if (response) {
        localStorage.setItem('isLoggedIn', 'true');
        return null;
      }
      return 'Incorrect code. Please try again.';
    } catch (err) {
      console.error(err);
      return 'Incorrect code. Please try again.';
    }
  };

  const handleUseAnotherEmail = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setStep(1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-primary p-4">
      <div className="w-full max-w-md">
        <Card className="border-theme-primary bg-theme-secondary shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold text-theme-primary">DeFi Alerts for Compound</CardTitle>
            <CardDescription className="text-center text-theme-muted">Monitor and receive alerts for Compound markets</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <EmailForm onSubmit={handleEmailSubmit} initialEmail={email} />
            ) : (
              <VerificationForm email={email} onSubmit={handleVerificationSubmit} onChangeEmail={handleUseAnotherEmail} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
