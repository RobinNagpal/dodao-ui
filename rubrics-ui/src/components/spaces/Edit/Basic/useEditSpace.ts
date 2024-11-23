import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { RubricSpace } from '@prisma/client';
import { ThemeColors } from '@dodao/web-core/types/space';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';

type adminUsernamesV1Type = {
  username: string;
  nameOfTheUser: string;
};

type AuthSettingsType = {
  enableLogin: boolean;
  loginOptions?: [string];
};

export type SpaceEditType = {
  id: string;
  avatar: string;
  creator: string;
  name: string;
  domains: [string];
  adminUsernamesV1: [adminUsernamesV1Type];
  authSettings: AuthSettingsType;
  themeColors: ThemeColors;
};

export type UseEditSpaceHelper = {
  space: SpaceEditType;
  setSpaceField: (field: keyof RubricSpace, value: any) => void;
  setAuthSettingsField: (field: keyof AuthSettingsType, value: any) => void;
  upsertSpace: () => Promise<void>;
  upserting: boolean;
  initialize: () => Promise<void>;
};

export default function useEditSpace(): UseEditSpaceHelper {
  const { showNotification } = useNotificationContext();
  const { data: session } = useSession() as { data: Session | null };
  const [space, setSpace] = useState<SpaceEditType>({
    id: session?.spaceId || '',
    adminUsernamesV1: [{ username: 'John', nameOfTheUser: 'Doe' }],
    avatar: '',
    creator: '',
    name: '',
    domains: ['dodao.io'],
    authSettings: { enableLogin: true },
    themeColors: {
      primaryColor: '#384aff',
      bgColor: '#ffffff',
      textColor: '#57606a',
      linkColor: '#111111',
      headingColor: '#111111',
      borderColor: '#d0d7de',
      blockBg: '#F5F9FF',
      primaryTextColor: '#ffffff',
    },
  });

  const [upserting, setUpserting] = useState(false);
  const router = useRouter();

  async function initialize() {
    if (session?.spaceId) {
      try {
        let response = await fetch(`/api/space/${session.spaceId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const spaceResponse = await response.json();
          setSpace(spaceResponse.space);
        }
      } catch (error) {
        console.error(error);
        showNotification({ type: 'error', message: 'Error while getting user' });
        throw error;
      }
    }
  }

  function setSpaceField(field: keyof RubricSpace, value: any) {
    setSpace((prev: any) => ({ ...prev, [field]: value }));
  }

  function setAuthSettingsField(field: keyof AuthSettingsType, value: any) {
    setSpace((prev: any) => ({ ...prev, authSettings: { ...prev.authSettings, [field]: value } }));
  }

  async function upsertSpace() {
    setUpserting(true);
    try {
      let response = await fetch(`/api/space/upsert`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...space,
        }),
      });

      if (response.ok) {
        showNotification({ type: 'success', message: 'Space upserted successfully' });
        router.push('/homepage'); // Redirect to the Home page
      } else {
        showNotification({ type: 'error', message: 'Error while upserting space' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting space' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  return {
    space,
    setSpaceField,
    setAuthSettingsField,
    upsertSpace,
    upserting,
    initialize,
  };
}
