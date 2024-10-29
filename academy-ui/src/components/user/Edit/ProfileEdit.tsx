'use client';

import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import WebCoreProfileEdit from '@dodao/web-core/components/profile/WebCoreProfileEdit';
import { Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import { useFetchData, useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface ProfileEditProps {
  space: SpaceWithIntegrationsFragment;
}

function ProfileEdit({ space }: ProfileEditProps) {
  const { putData } = useFetchUtils();
  const { data: session } = useSession() as { data: Session | null };
  const [upserting, setUpserting] = useState(false);
  const defaultUserFields = {
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
  const [user, setUser] = useState<User>(defaultUserFields);
  const { data, reFetchData } = useFetchData<User>(
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
    setUpserting(true);
    const userReq: User = {
      ...user,
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
    };
    await putData<User, User>(`${getBaseUrl()}/api/${space.id}/users/${user.id}`, userReq, {
      successMessage: 'User updated successfully',
      errorMessage: 'Error while updating user',
      redirectPath: '/',
    });
    setUpserting(false);
  }

  return <WebCoreProfileEdit user={user} saveUser={(user) => upsertUser(user)} loading={upserting} />;
}

export default ProfileEdit;
