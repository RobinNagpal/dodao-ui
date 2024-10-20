'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { isEmpty } from 'lodash';

interface LoginInformationProps {
  goToNextStep: () => void;
}

export default function LoginInfo({ goToNextStep }: LoginInformationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [captcha, setCaptcha] = useState<string | null>('');
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
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

    if (!name.trim() || !email.trim() || !phone.trim()) {
      showNotification({ type: 'error', message: 'Name, email and phone number cannot be empty' });
      return;
    }

    try {
      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phoneNumber: phone,
          username: username,
          spaceId: spaceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }
      goToNextStep();
      setName('');
      setEmail('');
      setPhone('');
      setCaptcha(null);
    } catch (error) {
      showNotification({ type: 'error', message: 'Error updating user data' });
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/api/auth/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        if (userData) {
          setName(userData.name || '');
          setEmail(userData.email || '');
          setPhone(userData.phoneNumber || '');
        }
      } catch (error) {
        showNotification({ type: 'error', message: 'Error fetching user data' });
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="space-y-12 text-left mt-8 sm:px-0 px-4">
      <div>
        <h1 className="text-lg font-bold leading-7">Basic Login Credentials</h1>
        <p className="mt-1 text-sm leading-6">Please provide login data to proceed!</p>
        <Input className="mt-4" label="Name" modelValue={name} onUpdate={handleNameChange} />
        <Input label="Email" modelValue={email} onUpdate={handleEmailChange} />
        <Input label="Phone Number" modelValue={phone} onUpdate={handlePhoneChange} />
        <ReCAPTCHA ref={captchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} className="mt-4" />
      </div>
      <div className="flex items-center justify-start gap-x-6">
        <Button variant="contained" primary removeBorder={true} disabled={!captcha || isEmpty(name) || isEmpty(email) || isEmpty(phone)} onClick={handleSave}>
          Next
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </div>
    </div>
  );
}
