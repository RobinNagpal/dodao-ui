import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { BaseUser } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

export type UseEditUserProfileHelper = {
  user: BaseUser;
  setUserField: (field: keyof BaseUser, value: any) => void;
  upsertUser: () => Promise<void>;
  upserting: boolean;
  initialize: () => Promise<void>;
};

export default function useEditUser(userName: string, update: () => void): UseEditUserProfileHelper {
  const { showNotification } = useNotificationContext();
  const [user, setUser] = useState<BaseUser>({
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
    password: '',
  });

  const [upserting, setUpserting] = useState(false);
  const router = useRouter();

  async function initialize() {
    if (userName) {
      try {
        let response = await fetch(`/api/queries/users/by-username?username=${userName}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const userResponse = await response.json();
          setUser(userResponse.user);
        }
      } catch (error) {
        console.error(error);
        showNotification({ type: 'error', message: 'Error while getting user' });
        throw error;
      }
    }
  }

  function setUserField(field: keyof BaseUser, value: any) {
    setUser((prev: any) => ({ ...prev, [field]: value }));
  }

  async function upsertUser() {
    setUpserting(true);
    try {
      let response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
        }),
      });

      if (response.ok) {
        update();
        showNotification({ type: 'success', message: 'User upserted successfully' });
        router.push('/homepage'); // Redirect to the Home page
      } else {
        showNotification({ type: 'error', message: 'Error while upserting user' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting user' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  return {
    user,
    setUserField,
    upsertUser,
    upserting,
    initialize,
  };
}
