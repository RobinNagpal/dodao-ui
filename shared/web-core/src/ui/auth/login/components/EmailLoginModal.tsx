'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { getEmailProviderUrl } from '@dodao/web-core/utils/api/getEmailProviderUrl';
import { useState } from 'react';

export interface EmailLoginModalProps {
  space: WebCoreSpace;
  open: boolean;
  onClose: () => void;
}

function EmailLoginModal({ open, onClose, space }: EmailLoginModalProps) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [upserting, setUpserting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpserting(true);
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
    setUpserting(false);
    if (response?.ok) {
      setEmailSent(true);
    } else {
      alert('Failed to send verification email. Please try again.');
    }
  };

  const handleLinkClick = () => {
    const url = getEmailProviderUrl(email);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Email provider not recognized. Please open your email manually.');
    }
  };

  return (
    <SingleSectionModal open={open} onClose={onClose} title={'Login with Email'}>
      <div className="text-left py-4">
        {!emailSent ? (
          <form onSubmit={handleEmailSubmit}>
            <Input
              id="email"
              modelValue={email}
              placeholder="john@example.com"
              onUpdate={(e) => (e ? setEmail(e.toString()) : setEmail(''))}
              required
              label={'Email Address'}
            />
            <div className="w-full flex justify-center">
              <Button type="submit" primary variant={'contained'} className="mt-4" loading={upserting}>
                Login
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p>
              A verification link has been sent to{' '}
              <span onClick={handleLinkClick} className="underline link-color cursor-pointer">
                your email
              </span>
              . Click on the link provided in the email to log in.
            </p>
          </div>
        )}
      </div>
    </SingleSectionModal>
  );
}

export default EmailLoginModal;
