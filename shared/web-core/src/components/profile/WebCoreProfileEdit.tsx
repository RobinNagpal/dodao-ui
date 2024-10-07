'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useState, useEffect } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';
import { User } from '@dodao/web-core/types/auth/User';

interface WebCoreProfileEditProps {
  user: User;
  saveUser: (user: User) => Promise<void>;
  loading: boolean;
}

function WebCoreProfileEdit({ user, saveUser, loading }: WebCoreProfileEditProps) {
  const [updatedUser, setUpdatedUser] = useState<User>(user);
  console.log('user dawod : ', user);
  function setUserField(field: keyof User, value: any) {
    setUpdatedUser({ ...updatedUser, [field]: value });
  }

  useEffect(() => {
    setUpdatedUser(user);
  }, [user]);

  return (
    <PageWrapper>
      <Block title="Edit User Profile">
        <div className="">
          <Input label="Email / Username" modelValue={updatedUser.email} onUpdate={(value) => setUserField('email', value?.toString() || '')} disabled />
          <Input label="Name" modelValue={updatedUser.name} onUpdate={(value) => setUserField('name', value?.toString() || '')} />
          <Input label="Phone Number" modelValue={updatedUser.phone_number} onUpdate={(value) => setUserField('phone_number', value?.toString() || '')} />
        </div>
        <div className="mt-10">
          <Button
            variant="contained"
            primary
            loading={loading}
            disabled={loading}
            onClick={async () => {
              await saveUser(updatedUser);
            }}
          >
            Save Profile
          </Button>
        </div>
      </Block>
    </PageWrapper>
  );
}

export default WebCoreProfileEdit;
