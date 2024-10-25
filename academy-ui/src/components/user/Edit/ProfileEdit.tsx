'use client';

import React, { useState, useEffect } from 'react';
import WebCoreProfileEdit from '@dodao/web-core/components/profile/WebCoreProfileEdit';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { User } from '@dodao/web-core/types/auth/User';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';

interface ProfileEditProps {
  space: SpaceWithIntegrationsFragment;
}

function ProfileEdit({ space }: ProfileEditProps) {
  const { fetchData, putData } = useFetchUtils();
  const { data: session } = useSession() as { data: Session | null };
  const [upserting, setUpserting] = useState(false);
  const router = useRouter();
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

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchData<User>(`${getBaseUrl()}/api/${space.id}/queries/users/by-username`, 'Error while fetching user');
      setUser(userData || defaultUserFields);
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
