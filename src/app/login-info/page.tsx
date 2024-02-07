'use client';

import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updatedUser, setUpdatedUser] = useState(null);
  const { data: session } = useSession();

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

    if (!name.trim() || !email.trim()) {
      console.error('Name and email cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/auth/update-user', {
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

      const updatedUser = await response.json();
      setUpdatedUser(updatedUser);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-12 text-left p-6">
        <div>
          <h1 className="text-base font-semibold leading-7">Basic Login Credentials</h1>
          <p className="mt-1 text-sm leading-6">Please provide login data to proceed!</p>
          <Input className="mt-4" label="Name" modelValue={name} onUpdate={handleNameChange} />
          <Input label="Email" modelValue={email} onUpdate={handleEmailChange} />
          <Input label="Phone Number" modelValue={phone} onUpdate={handlePhoneChange} />
        </div>
        <div className="flex items-center justify-start gap-x-6">
          <Button variant="contained" primary onClick={handleSave}>
            Save
          </Button>
        </div>
        {updatedUser && (
          <div className="mt-4">
            <p>Name: {updatedUser['name']}</p>
            <p>Email: {updatedUser['email']}</p>
            <p>Phone: {updatedUser['phone_number']}</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
