'use client';

import withSpace, { SpaceProps } from '@/app/withSpace';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useState } from 'react';

export interface EmailLoginModalProps extends SpaceProps {
  open: boolean;
  onClose: () => void;
}

function EmailLoginModal({ open, onClose, space }: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assume this fetch function sends an email to the user
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
      setEmailSent(true);
    } else {
      alert('Failed to send verification email. Please try again.');
    }
  };

  return (
    <FullScreenModal open={open} onClose={onClose} title={'Login with Email'}>
      <PageWrapper>
        <div className="text-left">
          {!emailSent ? (
            <form onSubmit={handleEmailSubmit}>
              <Input id="email" modelValue={email} onUpdate={(e) => (e ? setEmail(e.toString()) : setEmail(''))} required label={'Email Address'} />
              <Button type="submit" primary variant={'contained'} className="mt-4">
                Send Verification Email
              </Button>
            </form>
          ) : (
            <div>
              <p>An email has been sent to {email}. Click on the link in the email to log in.</p>
            </div>
          )}
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
}

export default withSpace(EmailLoginModal);
