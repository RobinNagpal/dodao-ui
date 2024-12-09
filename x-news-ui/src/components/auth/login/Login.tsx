'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useState } from 'react';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { LoginRequest } from '@/types/request/LoginRequest';
import { LoginResponse } from '@/types/response/LoginResponse';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { isAdmin } from '@/utils/auth/isAdmin';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default function Loginpage() {
  const [key, setKey] = useState<string>('');
  const [upserting, setUpserting] = useState<boolean>(false);

  const { postData } = usePostData<LoginResponse, LoginRequest>(
    {
      errorMessage: 'Failed to login',
    },
    {}
  );

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpserting(true);
    const response = await postData(`${getBaseUrl()}/api/login-as-admin`, {
      key,
    });

    setUpserting(false);
    if (response?.key) {
      localStorage.setItem('ADMIN_KEY', response.key);
    } else {
      alert('Failed to login.');
    }
  };
  return (
    <PageWrapper>
      <div className="w-1/2 mx-auto">
        {isAdmin() ? (
          <div className="font-semibold text-lg text-center">You are already logged in as admin.</div>
        ) : (
          <form onSubmit={handleKeySubmit}>
            <Input id="key" modelValue={key} onUpdate={(e) => (e ? setKey(e.toString()) : setKey(''))} required label={'Admin Key'} />
            <div className="w-full flex justify-center">
              <Button type="submit" primary variant={'contained'} className="mt-4" loading={upserting}>
                Login
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}
