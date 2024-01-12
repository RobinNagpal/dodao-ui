'use client';

import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import React from 'react';

function LoginPage() {
  const { data: session } = useSession();
  const { logout, active } = useAuth();

  return (
    <PageWrapper>
      <div className="space-y-12 text-left p-6">
        <div>
          <h1 className="text-base font-semibold leading-7">Basic Login Credentials</h1>
          <p className="mt-1 text-sm leading-6">Please provide login data to proceed!</p>
          <Input className="mt-4" label="Name" />
          <Input label="Email" />
        </div>
        <div className="flex items-center justify-start gap-x-6">
          <Button
            variant="contained"
            primary
            // loading={}
            // disabled={uploadThumbnailLoading || upserting}
            // onClick={async () => {
            //   await upsertSpace();
            //   props.onClose();
            // }}
          >
            Save
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
