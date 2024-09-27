'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { useState } from 'react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
// import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';

export interface EmailSignupModalProps {
  open: boolean;
  onClose: () => void;
}

async function EmailSignupModal({ open, onClose }: EmailSignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [upserting, setUpserting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { showNotification } = useNotificationContext();
  // const space = await getSpaceServerSide();

  const onSubmit = async () => {
    try {
      setUpserting(true);
      const response = await fetch('/api/auth/custom-email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ email, password, spaceId: space.id, provider: 'email' }),
      });
      setUpserting(false);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Process response here
      console.log('Registration Successful', response);
      showNotification({ type: 'success', message: 'User registered successfully' });
      setRegistered(true);
    } catch (error: any) {
      console.error('Registration Failed:', error);
      showNotification({ type: 'error', message: 'Error while registering the user' });
    }
  };

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
        // spaceId: space.id,
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
    <FullPageModal open={open} onClose={onClose} title={'Signup with Email'}>
      <PageWrapper>
        <div className="text-left">
          {!emailSent ? (
            <form>
              <Input label={'Email Address'} id="email" modelValue={email} onUpdate={(e) => (e ? setEmail(e.toString()) : setEmail(''))} required />
              <Input
                label={'Password'}
                id="password"
                modelValue={password}
                onUpdate={(e) => (e ? setPassword(e.toString()) : setPassword(''))}
                password
                required
              />
              <Button
                variant="contained"
                primary
                loading={upserting}
                onClick={async () => {
                  await onSubmit();
                }}
              >
                Signup
              </Button>
            </form>
          ) : (
            <div>
              <p>An email has been sent to {email}. Click on the link in the email to log in.</p>
            </div>
          )}
        </div>
      </PageWrapper>
      {registered && (
        <FullPageModal open={true} onClose={() => {}} title={''}>
          <div className="flex flex-col items-center p-8 rounded-lg shadow-md pb-16">
            <div className="text-center">
              <h1 className="text-xl font-semibold">Verification Needed</h1>
              <p className="mt-4 text-md">
                Please check your inbox. We have sent a verification email to your address. To proceed, click the link provided in that email.
              </p>
            </div>
          </div>
        </FullPageModal>
      )}
    </FullPageModal>
  );
}

export default EmailSignupModal;
