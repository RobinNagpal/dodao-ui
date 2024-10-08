import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type UseEditUserProfileHelper = {
  user: User;
  setUserField: (field: keyof User, value: any) => void;
  upsertUser: () => Promise<void>;
  upserting: boolean;
  initialize: () => Promise<void>;
};

export default function useEditUser(userName: string, update: () => void, spaceId: string): UseEditUserProfileHelper {
  const { showNotification } = useNotificationContext();
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

  const [upserting, setUpserting] = useState(false);
  const router = useRouter();

  async function initialize() {
    if (userName) {
      try {
        let response = await fetch(`/api/${spaceId}/queries/users/by-username?username=${userName}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const userResponse = await response.json();
          setUser(userResponse);
        }
      } catch (error) {
        console.error(error);
        showNotification({ type: 'error', message: 'Error while getting user' });
        throw error;
      }
    }
  }

  function setUserField(field: keyof User, value: any) {
    setUser((prev: any) => ({ ...prev, [field]: value }));
  }

  async function upsertUser() {
    setUpserting(true);
    try {
      let response = await fetch(`/api/${spaceId}/users/${user.id}`, {
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
        showNotification({ type: 'success', message: 'User updated successfully' });
        router.push('/'); // Redirect to the Home page
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

  return {
    user,
    setUserField,
    upsertUser,
    upserting,
    initialize,
  };
}
