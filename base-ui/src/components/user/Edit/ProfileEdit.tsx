'use client';

import WebCoreProfileEdit from '@dodao/web-core/components/profile/WebCoreProfileEdit';
import { Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BaseSpace } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface ProfileEditProps {
  space: BaseSpace;
}

function ProfileEdit({ space }: ProfileEditProps) {
  const { updateData: putData, loading } = useUpdateData<User, User>(
    {},
    {
      successMessage: 'User updated successfully',
      errorMessage: 'Error while updating user',
      redirectPath: '/homepage',
    },
    'PUT'
  );
  const { data: session } = useSession() as { data: Session | null };
  const initialState = {
    id: '',
    name: '',
    authProvider: '',
    email: '',
    image: '',
    emailVerified: new Date(),
    phoneNumber: '',
    publicAddress: '',
    spaceId: '',
    username: '',
  };
  const [user, setUser] = useState<User>(initialState);
  const { reFetchData } = useFetchData<User>(
    `${getBaseUrl()}/api/${space.id}/queries/users/by-username`,
    {
      skipInitialFetch: true,
    },
    'Error while fetching user'
  );

  const fetchUser = async () => {
    if (session) {
      const user = await reFetchData();
      if (user) {
        setUser(user);
      }
    }
  };

  useEffect(() => {
    if (session) {
      fetchUser();
    } else {
      console.error('Session is not available');
    }
  }, [session]);

  async function upsertUser(updatedUser: User) {
    const userReq: User = {
      ...user,
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
    };
    await putData(`${getBaseUrl()}/api/users/${user.id}`, userReq);
  }

  return <WebCoreProfileEdit user={user} saveUser={(user) => upsertUser(user)} loading={loading} />;
}

export default ProfileEdit;
