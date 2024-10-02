'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import useEditUser from '@/components/user/Edit/useEditUser';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';
import React, { useEffect } from 'react';
import withSpace, { SpaceProps } from '@/contexts/withSpace';

function UpsertUserProfileInfo({ space }: SpaceProps) {
  const { data: session, update } = useSession() as { data: Session | null; update: any };
  const editUserHelper = useEditUser(session?.username!, update, space.id);

  const { user, setUserField, upsertUser, upserting, initialize } = editUserHelper;

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="p-6">
      <div className="space-y-12 text-left p-6">
        <div className="">
          <div className="flex items-center justify-center">
            <h2 className="font-semibold leading-7 text-3xl">Edit User Profile</h2>
          </div>
          <Input label="Email" modelValue={user?.email} onUpdate={(value) => setUserField('email', value?.toString() || '')} disabled />
          <Input label="Name" modelValue={user?.name} onUpdate={(value) => setUserField('name', value?.toString() || '')} />
          <Input label="Phone Number" modelValue={user?.phone_number} onUpdate={(value) => setUserField('phone_number', value?.toString() || '')} />
        </div>
        <div className="flex items-center justify-end gap-x-6">
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
    </div>
  );
}

export default withSpace(UpsertUserProfileInfo);
