import { createContext, useContext, ReactNode, Context } from 'react';
import useNotification, { UseNotificationType } from '../hooks/useNotification';

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext: Context<UseNotificationType> = createContext<UseNotificationType>({
  notification: null,
  showNotification: (e: any) => {},
  hideNotification: () => {},
});

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notification = useNotification();
  return <NotificationContext.Provider value={notification}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};
