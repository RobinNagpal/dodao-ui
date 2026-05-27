import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { ShowNotificationOptions } from '@dodao/web-core/ui/hooks/useNotification';
import { signOut } from 'next-auth/react';

let logoutInProgress = false;

export async function handleUnauthorized(showNotification: (opts: ShowNotificationOptions) => void): Promise<void> {
  if (logoutInProgress) return;
  logoutInProgress = true;

  showNotification({ type: 'error', message: 'Your session has expired. Please log in again.' });
  localStorage.removeItem(DODAO_ACCESS_TOKEN_KEY);
  await signOut({ redirect: true, callbackUrl: `/login?updated=${Date.now()}` });
}
