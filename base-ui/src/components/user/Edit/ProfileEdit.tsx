'use client';

import WebCoreProfileEdit from '@dodao/web-core/components/profile/WebCoreProfileEdit';
import { Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import { BaseSpace } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface ProfileEditProps {
  space: BaseSpace;
}

function ProfileEdit({ space }: ProfileEditProps) {
  const { fetchData, putData } = useFetchUtils();
  const { data: session } = useSession() as { data: Session | null };
  const [upserting, setUpserting] = useState(false);
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

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchData<User>(`${getBaseUrl()}/api/queries/users/by-username?username=${session?.username}`, 'Error while fetching user');
      setUser(userData || initialState);
    };

    if (session) {
      fetchUser();
    } else {
      console.error('Session is not available');
    }
  }, [session]);

  async function upsertUser(updatedUser: User) {
    setUpserting(true);
    const userReq: User = {
      ...user,
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
    };
    await putData<User, User>(`${getBaseUrl()}/api/users/${user.id}`, userReq, {
      successMessage: 'User updated successfully',
      errorMessage: 'Error while updating user',
      redirectPath: '/homepage',
    });
    setUpserting(false);
  }

  return <WebCoreProfileEdit user={user} saveUser={(user) => upsertUser(user)} loading={upserting} />;
}

export default ProfileEdit;
