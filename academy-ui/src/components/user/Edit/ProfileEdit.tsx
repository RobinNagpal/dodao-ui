'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import useEditUser from '@/components/user/Edit/useEditUser';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';
import React, { useEffect } from 'react';
import { SpaceProps } from '@/contexts/withSpace';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';

function UpsertUserProfileInfo({ space }: SpaceProps) {
  const { data: session, update } = useSession() as { data: Session | null; update: any };
  const editUserHelper = useEditUser(session?.username!, update, space.id);

  const { user, setUserField, upsertUser, upserting, initialize } = editUserHelper;

  useEffect(() => {
    initialize();
  }, []);

  return (
    <PageWrapper>
      <Block title="Edit User Profile">
        <div className="">
          <Input label="Email / Username" modelValue={user?.email} onUpdate={(value) => setUserField('email', value?.toString() || '')} disabled />
          <Input label="Name" modelValue={user?.name} onUpdate={(value) => setUserField('name', value?.toString() || '')} />
          <Input label="Phone Number" modelValue={user?.phone_number} onUpdate={(value) => setUserField('phone_number', value?.toString() || '')} />
        </div>
        <div className="mt-10">
          <Button
            variant="contained"
            primary
            loading={upserting}
            disabled={upserting}
            onClick={async () => {
              await upsertUser();
            }}
          >
            Save Profile
          </Button>
        </div>
      </Block>
    </PageWrapper>
  );
}

export default UpsertUserProfileInfo;
