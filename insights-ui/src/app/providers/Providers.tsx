'use client';
import SessionProvider from '@/app/providers/SessionProvider';
import SessionTokenSync from '@/app/providers/SessionTokenSync';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import NextAuthErrorCapture from '@dodao/web-core/ui/auth/NextAuthErrorCapture';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NotificationProvider>
      <SessionProvider>
        <NextAuthErrorCapture />
        <SessionTokenSync />
        <NotificationWrapper />
        {children}
      </SessionProvider>
    </NotificationProvider>
  );
}
