'use client';

import React, { useState, useEffect } from 'react';
import WebCoreProfileEdit from '@dodao/web-core/components/profile/WebCoreProfileEdit';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { User } from '@dodao/web-core/types/auth/User';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';

interface ProfileEditProps {
  space: SpaceWithIntegrationsFragment;
}

function ProfileEdit({ space }: ProfileEditProps) {
  const { showNotification } = useNotificationContext();
  const { data: session } = useSession() as { data: Session | null };
  const [upserting, setUpserting] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    authProvider: '',
    email: '',
    image: '',
    emailVerified: new Date(),
    phone_number: '',
    publicAddress: '',
    spaceId: '',
    username: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/${space.id}/queries/users/by-username?username=${session?.username}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          showNotification({ type: 'error', message: 'Error while fetching user' });
        }
      } catch (error) {
        console.error(error);
        showNotification({ type: 'error', message: 'Error while fetching user' });
        throw error;
      }
    };

    if (session) {
      fetchUser();
    } else {
      console.error('Session is not available');
    }
  }, []);

  async function upsertUser(updatedUser: User) {
    setUpserting(true);
    const userReq: User = {
      ...user,
      name: updatedUser.name,
      phone_number: updatedUser.phone_number,
    };
    try {
      let response = await fetch(`/api/${space.id}/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userReq,
        }),
      });

      if (response.ok) {
        showNotification({ type: 'success', message: 'User updated successfully' });
        router.push('/');
      } else {
        showNotification({ type: 'error', message: 'Error while updating user' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while updating user' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  return <WebCoreProfileEdit user={user} saveUser={(user) => upsertUser(user)} loading={upserting} />;
}

export default ProfileEdit;
