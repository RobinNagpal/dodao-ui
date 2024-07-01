'use client';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useState } from 'react';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';

interface LoginProps {
  space: WebCoreSpace;
}

export default function Login({ space }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [upserting, setUpserting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { showNotification } = useNotificationContext();

  const onSubmit = async () => {
    try {
      setUpserting(true);
      const response = await fetch('/api/auth/custom-email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, spaceId: space.id, provider: 'email' }),
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

  return (
    <div className="p-6">
      <div className="space-y-12 text-left p-6">
        <div className="">
          <h2 className="font-semibold leading-7 text-3xl text-center pb-8">Signup using Email</h2>
          <Input label="Email" modelValue={email} onUpdate={(value) => setEmail(value?.toString() || '')} />
          <Input label="Password" modelValue={password} onUpdate={(value) => setPassword(value?.toString() || '')} password />
        </div>
      </div>
      <div className="p-6 flex items-center justify-end gap-x-6">
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
      </div>
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
    </div>
  );
}
