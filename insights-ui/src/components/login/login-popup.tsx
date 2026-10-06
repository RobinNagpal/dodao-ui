'use client';

import { EmailSentMessage } from '@/components/login/email-sent-message';
import { UserLogin } from '@/components/login/user-login';
import { usePageTheme } from '@/components/theme/page-theme-context';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { lightThemeColors, themeColors } from '@/util/theme-colors';
import { getCurrentReturnPath } from '@/utils/credits/credit-return-path';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
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

/**
 * Attribute set on `<body>` while any login popup is open. Floating page
 * controls that would sit over the modal (e.g. `FloatingReportCta`) hide
 * themselves with a `[body[data-login-popup-open]_&]:hidden` variant.
 */
export const LOGIN_POPUP_OPEN_BODY_ATTR = 'data-login-popup-open';

// Several popups can be mounted on one page; keep the flag until the last open one closes.
let openLoginPopupCount = 0;

function useLoginPopupOpenBodyFlag(open: boolean): void {
  useEffect(() => {
    if (!open) {
      return;
    }
    openLoginPopupCount += 1;
    document.body.setAttribute(LOGIN_POPUP_OPEN_BODY_ATTR, '');
    return () => {
      openLoginPopupCount = Math.max(0, openLoginPopupCount - 1);
      if (openLoginPopupCount === 0) {
        document.body.removeAttribute(LOGIN_POPUP_OPEN_BODY_ATTR);
      }
    };
  }, [open]);
}

export function LoginPopup({ open, onClose }: LoginPopupProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  // The modal's DOM is portaled to the document body (outside the theme
  // provider's wrapper), so it can't inherit the swapped palette via the CSS
  // cascade. React context still reaches it, so read the app-wide theme and
  // re-declare the tokens on the content wrapper below.
  const modalTheme = usePageTheme();
  const isDark = modalTheme === 'dark';

  const { postData: postLogin } = usePostData<LoginResponse, LoginRequest>({
    errorMessage: 'Failed to send login email. Please try again.',
  });

  useLoginPopupOpenBodyFlag(open);

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
    <FullPageModal open={open} onClose={onClose} title="" showCloseButton={false} fullWidth className="w-full max-w-md px-4">
      <div style={{ ...(isDark ? themeColors : lightThemeColors) }} className={isDark ? '' : 'page-theme-light'}>
        {step === 1 ? (
          <UserLogin onLogin={handleEmailSubmit} onGoogleSignIn={handleGoogleSignIn} errorMessage={errorMessage} compact />
        ) : (
          <EmailSentMessage email={email} onChangeEmail={handleUseAnotherEmail} compact />
        )}
      </div>
    </FullPageModal>
  );
}
