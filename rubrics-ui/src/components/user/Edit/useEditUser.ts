import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { RubricUser } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

export type UseEditUserProfileHelper = {
  user: RubricUser;
  setUserField: (field: keyof RubricUser, value: any) => void;
  upsertUser: () => Promise<void>;
  upserting: boolean;
  initialize: () => Promise<void>;
};

export default function useEditUser(userName: string, update: () => void): UseEditUserProfileHelper {
  const { showNotification } = useNotificationContext();
  const [user, setUser] = useState<RubricUser>({
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
    password: '',
  });

  const [upserting, setUpserting] = useState(false);
  const router = useRouter();

  async function initialize() {
    if (userName) {
      try {
        let response = await fetch(`/api/user/${userName}`, {
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

  function setUserField(field: keyof RubricUser, value: any) {
    setUser((prev: any) => ({ ...prev, [field]: value }));
  }

  async function upsertUser() {
    setUpserting(true);
    try {
      let response = await fetch(`/api/user/edit`, {
        method: 'POST',
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
