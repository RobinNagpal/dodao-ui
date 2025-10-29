'use client';
import SessionProvider from '@/app/providers/SessionProvider';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NotificationProvider>
      <SessionProvider>
        <NotificationWrapper />
        {children}
      </SessionProvider>
    </NotificationProvider>
  );
}
