'use client';

import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
// pages/auth.tsx
import { useState } from 'react';
import { signIn } from 'next-auth/react';

const EmailAuthPage = () => {
  const [email, setEmail] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Handle email submission to send the verification code
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger Next-Auth sign-in flow for email
    const result = await signIn('email', { email, redirect: false, callbackUrl: '/' });
    if (result?.ok) {
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
    <PageWrapper>
      <div>
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
  );
};

export default EmailAuthPage;
