'use client';

import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

function LoginPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleNameChange = (value: string | number | undefined) => {
    setName(value as string);
  };

  const handleEmailChange = (value: string | number | undefined) => {
    setEmail(value as string);
  };

  async function updateSession() {
    if (!name || !email) {
      console.log('Please enter both name and email.');
      return;
    }
    const result = await update({
      ...session,
      user: {
        name: name,
        email: email,
      },
    });
    if (result) {
      console.log(session);
      router.refresh();
      router.push('/login');
      setName('');
      setEmail('');
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-12 text-left p-6">
        <div>
          <h1 className="text-base font-semibold leading-7">Basic Login Credentials</h1>
          <p className="mt-1 text-sm leading-6">Please provide login data to proceed!</p>
          <Input className="mt-4" label="Name" modelValue={name} onUpdate={handleNameChange} />
          <Input label="Email" modelValue={email} onUpdate={handleEmailChange} />
        </div>
        <div className="flex items-center justify-start gap-x-6">
          <Button variant="contained" primary onClick={updateSession}>
            Save
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
