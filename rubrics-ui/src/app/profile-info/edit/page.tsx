'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import useEditUser from '@/components/user/Edit/useEditUser';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';
import React, { useEffect } from 'react';

export default function UpsertUserProfileInfo() {
  const { data: session, update } = useSession() as { data: Session | null; update: any };
  const editUserHelper = useEditUser(session?.username!, update);

  const { user, setUserField, upsertUser, upserting, initialize } = editUserHelper;

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="p-6">
      <div className="space-y-12 text-left p-6">
        <div className="border-b pb-12">
          <h2 className="font-semibold leading-7 text-3xl">Edit User Profile</h2>
          <p className="mt-1 text-sm leading-6">Update the details of User</p>

          <Input label="Id" modelValue={user?.id} onUpdate={(value) => setUserField('id', value?.toString() || '')} disabled />
          <Input label="Name" modelValue={user?.name} onUpdate={(value) => setUserField('name', value?.toString() || '')} />
          <Input label="Email" modelValue={user?.email} onUpdate={(value) => setUserField('email', value?.toString() || '')} />
          <Input label="Phone Number" modelValue={user?.phone_number} onUpdate={(value) => setUserField('phone_number', value?.toString() || '')} />
          <Input
            label="Public Address"
            modelValue={user?.publicAddress}
            onUpdate={(value) => setUserField('publicAddress', value?.toString() || '')}
            disabled
          />
          <Input label="Auth Provider" modelValue={user?.authProvider} onUpdate={(value) => setUserField('authProvider', value?.toString() || '')} disabled />
          <Input label="Space ID" modelValue={user?.spaceId} onUpdate={(value) => setUserField('spaceId', value?.toString() || '')} disabled />
          <Input label="UserName" modelValue={user?.username} onUpdate={(value) => setUserField('username', value?.toString() || '')} disabled />
        </div>
      </div>

      <div className="p-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={upserting}
          disabled={upserting}
          onClick={async () => {
            await upsertUser();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
