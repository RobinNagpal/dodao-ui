'use client';

import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface LoginInfoProps {
  onSuccessfulSave: () => void;
}

export default function LoginInfo({ onSuccessfulSave }: LoginInfoProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [captcha, setCaptcha] = useState<string | null>('');
  const { data: session } = useSession();
  const { showNotification } = useNotificationContext();
  const captchaRef = React.useRef(null);

  const handleNameChange = (value: string | number | undefined) => {
    setName(value as string);
  };

  const handleEmailChange = (value: string | number | undefined) => {
    setEmail(value as string);
  };

  const handlePhoneChange = (value: string | number | undefined) => {
    setPhone(value as string);
  };

  const handleSave = async () => {
    const username = session?.username;
    const spaceId = session?.spaceId;

    if (!captcha) {
      showNotification({ type: 'error', message: 'Please complete the reCAPTCHA to proceed.' });
      return;
    }

    if (!name.trim() || !email.trim()) {
      showNotification({ type: 'error', message: 'Name and email cannot be empty' });
      return;
    }

    try {
      const response = await fetch('/api/auth/updateUser', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone_number: phone,
          username: username,
          spaceId: spaceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }
      onSuccessfulSave();
      setName('');
      setEmail('');
      setPhone('');
      setCaptcha(null);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <div className="space-y-12 text-left mt-8">
      <div>
        <h1 className="text-lg font-bold leading-7">Basic Login Credentials</h1>
        <p className="mt-1 text-sm leading-6">Please provide login data to proceed!</p>
        <Input className="mt-4" label="Name" modelValue={name} onUpdate={handleNameChange} />
        <Input label="Email" modelValue={email} onUpdate={handleEmailChange} />
        <Input label="Phone Number" modelValue={phone} onUpdate={handlePhoneChange} />
        <ReCAPTCHA ref={captchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} className="mt-4" />
      </div>
      <div className="flex items-center justify-start gap-x-6">
        <Button variant="contained" primary onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
