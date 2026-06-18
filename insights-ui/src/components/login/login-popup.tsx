'use client';

import { EmailSentMessage } from '@/components/login/email-sent-message';
import { UserLogin } from '@/components/login/user-login';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { Contexts } from '@dodao/web-core/utils/constants/constants';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface LoginRequest {
  email: string;
  spaceId: string;
  context: string;
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
    signIn('google', { callbackUrl: '/' });
  };

  const handleUseAnotherEmail = (): void => {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setStep(1);
    setErrorMessage(undefined);
  };

  return (
    <FullPageModal open={open} onClose={onClose} title="" showCloseButton={false} className="w-full max-w-md px-4">
      {step === 1 ? (
        <UserLogin onLogin={handleEmailSubmit} onGoogleSignIn={handleGoogleSignIn} errorMessage={errorMessage} compact />
      ) : (
        <EmailSentMessage email={email} onChangeEmail={handleUseAnotherEmail} compact />
      )}
      <div className="mt-4 flex justify-center">
        <Button type="button" variant="outlined" primary={false} onClick={onClose} className="px-5 text-white border-gray-600 hover:border-gray-400">
          Maybe later
        </Button>
      </div>
    </FullPageModal>
  );
}
