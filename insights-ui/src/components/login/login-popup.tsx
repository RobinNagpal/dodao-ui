'use client';

import { EmailSentMessage } from '@/components/login/email-sent-message';
import { UserLogin } from '@/components/login/user-login';
import ThemedFullPageModal from '@/components/theme/ThemedFullPageModal';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCurrentReturnPath } from '@/utils/credits/credit-return-path';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface LoginRequest {
  email: string;
  spaceId: string;
  context: string;
  callbackPath?: string;
}

interface LoginResponse {
  userId: string;
}

interface LoginPopupProps {
  open: boolean;
  onClose: () => void;
}

export function LoginPopup({ open, onClose }: LoginPopupProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const { postData: postLogin } = usePostData<LoginResponse, LoginRequest>({
    errorMessage: 'Failed to send login email. Please try again.',
  });

  useEffect(() => {
    if (!open) {
      setStep(1);
      setEmail('');
      setErrorMessage(undefined);
    }
  }, [open]);

  const handleEmailSubmit = async (submittedEmail: string): Promise<void> => {
    try {
      setErrorMessage(undefined);
      const response = await postLogin(`/api/auth/custom-email/login-signup-by-email`, {
        email: submittedEmail,
        spaceId: KoalaGainsSpaceId,
        context: Contexts.loginAndRedirectToHome,
        // The email link brings the user back to this page after verifying.
        callbackPath: getCurrentReturnPath(),
      });

      if (response) {
        localStorage.setItem('email', submittedEmail);
        localStorage.setItem('userId', response.userId);
        setEmail(submittedEmail);
        setStep(2);
        return;
      }
      setErrorMessage('Error sending login email. Please try again.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Error sending login email. Please try again.');
    }
  };

  const handleGoogleSignIn = (): void => {
    // Back to the page the popup was opened on (e.g. the report whose Regenerate
    // or Buy Credits prompted the login), not the home page.
    signIn('google', { callbackUrl: getCurrentReturnPath() });
  };

  const handleUseAnotherEmail = (): void => {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setStep(1);
    setErrorMessage(undefined);
  };

  return (
    <ThemedFullPageModal open={open} onClose={onClose} title="" showCloseButton={false} fullWidth className="w-full max-w-md px-4">
      {step === 1 ? (
        <UserLogin onLogin={handleEmailSubmit} onGoogleSignIn={handleGoogleSignIn} errorMessage={errorMessage} compact />
      ) : (
        <EmailSentMessage email={email} onChangeEmail={handleUseAnotherEmail} compact />
      )}
    </ThemedFullPageModal>
  );
}
