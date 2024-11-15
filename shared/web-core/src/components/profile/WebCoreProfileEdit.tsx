'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import React, { useState, useEffect } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';
import { User } from '@dodao/web-core/types/auth/User';
import { FormFooter } from '../app/Form/FormFooter';

interface WebCoreProfileEditProps {
  user: User;
  saveUser: (user: User) => Promise<void>;
  loading: boolean;
}

function WebCoreProfileEdit({ user, saveUser, loading }: WebCoreProfileEditProps) {
  const [updatedUser, setUpdatedUser] = useState<User>(user);
  function setUserField(field: keyof User, value: any) {
    setUpdatedUser({ ...updatedUser, [field]: value });
  }

  useEffect(() => {
    setUpdatedUser(user);
  }, [user]);

  return (
    <PageWrapper>
      <Block title="Edit User Profile" className="font-semibold text-lg text-center">
        <div className="">
          <Input label="Email / Username" modelValue={updatedUser.email || updatedUser.username} disabled />
          <Input label="Name" modelValue={updatedUser.name} onUpdate={(value) => setUserField('name', value?.toString() || '')} />
          <Input label="Phone Number" modelValue={updatedUser.phoneNumber} onUpdate={(value) => setUserField('phoneNumber', value?.toString() || '')} />
        </div>
        <div className="mt-10">
          <FormFooter
            saveButtonText="Save Profile"
            onSave={async () => {
              await saveUser(updatedUser);
            }}
            onSaveLoading={loading}
            saveButtonDisabled={loading}
          />
        </div>
      </Block>
    </PageWrapper>
  );
}

export default WebCoreProfileEdit;
