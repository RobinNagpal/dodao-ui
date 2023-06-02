import { useCallback, useState } from 'react';
import { NotificationProps } from '@/components/core/notify/Notification';

export type ShowNotificationOptions = Omit<NotificationProps, 'onClose'>;
export interface UseNotificationType {
  notification: ShowNotificationOptions | null;
  showNotification: (options: ShowNotificationOptions) => void;
  hideNotification: () => void;
}

/** @deprecated use useNotificationContext instead */
const useNotification = (): UseNotificationType => {
  const [notification, setNotification] = useState<ShowNotificationOptions | null>(null);

  const showNotification = useCallback((options: ShowNotificationOptions) => {
    setNotification(options);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return { notification, showNotification, hideNotification };
};

export default useNotification;
