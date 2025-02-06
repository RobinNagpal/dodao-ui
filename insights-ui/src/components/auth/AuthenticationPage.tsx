'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useState } from 'react';
import { isAdmin } from '@/util/auth/isAdmin';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { authenticate } from '@/util/authenticate';
import { useRouter } from 'next/navigation';

export default function Authenticationpage() {
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [upserting, setUpserting] = useState<boolean>(false);

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpserting(true);
    const { success, message } = await authenticate(code);
    setUpserting(false);
    success ? router.push('/') : alert(message);
  };
  return (
    <PageWrapper>
      <div className="w-1/2 mx-auto">
        {isAdmin() ? (
          <div className="font-semibold text-lg text-center">You are already logged in as admin.</div>
        ) : (
          <form onSubmit={handleKeySubmit}>
            <Input id="key" modelValue={code} onUpdate={(e) => (e ? setCode(e.toString()) : setCode(''))} required label={'Admin Code'} />
            <div className="w-full flex justify-center">
              <Button type="submit" primary variant={'contained'} className="mt-4" loading={upserting}>
                Authenticate
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}
