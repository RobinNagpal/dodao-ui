'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import { useState } from 'react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { WebCoreSpace } from '@dodao/web-core/types/space';

export interface EmailSetupNewSpaceModalProps {
  open: boolean;
  onClose: () => void;
  space: WebCoreSpace;
}

function EmailSetupNewSpaceModal({ open, onClose, space }: EmailSetupNewSpaceModalProps) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [upserting, setUpserting] = useState(false);
  const { showNotification } = useNotificationContext();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpserting(true);
      const response = await fetch('/api/auth/custom-email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, spaceId: space.id, provider: 'email', context: 'setupNewSpace' }),
      });
      setUpserting(false);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Email sent successfully', response);
      setEmailSent(true);
    } catch (error: any) {
      console.error('Registration Failed:', error);
      alert('Failed to send verification email. Please try again.');
    }
  };

  const onModalClose = () => {
    onClose();
    // Delay the state reset slightly to allow the modal to fully close
    setTimeout(() => {
      setEmail('');
      setEmailSent(false);
    }, 300);
  };

  return (
    <SingleSectionModal open={open} onClose={onModalClose} title={'Setup New Space with Email'}>
      <div className="text-left py-4">
        {!emailSent ? (
          <form onSubmit={handleEmailSubmit}>
            <Input
              label={'Email Address'}
              id="email"
              modelValue={email}
              placeholder="john@example.com"
              onUpdate={(e) => (e ? setEmail(e.toString()) : setEmail(''))}
              required
            />

            <div className="w-full flex justify-center">
              <Button variant="contained" primary loading={upserting} className="mt-4" type="submit">
                Setup
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p>A verification link has been sent to your email. Click on the link provided in the email to log in.</p>
          </div>
        )}
      </div>
    </SingleSectionModal>
  );
}

export default EmailSetupNewSpaceModal;
