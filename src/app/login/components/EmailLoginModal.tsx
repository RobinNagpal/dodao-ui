'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import PageWrapper from '@/components/core/page/PageWrapper';
import { signIn } from 'next-auth/react';
// pages/auth.tsx
import { useState } from 'react';

export interface EmailLoginModalProps extends SpaceProps {
  open: boolean;
  onClose: () => void;
}
function EmailLoginModal({ open, onClose, space }: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Handle email submission to send the verification code
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger Next-Auth sign-in flow for email
    const response = await fetch('/api/auth/custom-email/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        spaceId: space.id,
        authProvider: 'custom-email',
      }),
    });

    if (response?.ok) {
      const resp = await response.json();
      await signIn('custom-email', {
        token: resp.token,
        callbackUrl: '/',
        redirect: false,
        spaceId: space.id,
      });
      setShowVerificationInput(true);
    } else {
      // Handle error or show a message to the user
      alert('Failed to send verification email. Please try again.');
    }
  };

  // Handle verification code submission (this part would typically be handled by Next-Auth automatically)
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically verify the code. Next-Auth handles this automatically in the background.
    // This step is just for demonstration and might not be necessary in your actual implementation.
    alert('Verification code submitted: ' + verificationCode);
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title={'Login with Email'}>
      <PageWrapper>
        <div className="text-left">
          {!showVerificationInput ? (
            // Email submission form
            <form onSubmit={handleEmailSubmit}>
              <Input id="email" modelValue={email} onUpdate={(e) => (e ? setEmail(e.toString()) : setEmail(''))} required label={'Email Address'} />
              <Button type="submit" primary variant={'contained'} className="mt-4">
                Send Verification Code
              </Button>
            </form>
          ) : (
            // Verification code input form
            <form onSubmit={handleVerificationSubmit}>
              <Input
                id="verificationCode"
                modelValue={verificationCode}
                onUpdate={(e) => (e ? setVerificationCode(e.toString()) : setVerificationCode(''))}
                required
                label={'Verification Code'}
              />
              <Button type="submit" primary variant={'contained'} className="mt-4">
                Verify Code
              </Button>
            </form>
          )}
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
}

export default withSpace(EmailLoginModal);
