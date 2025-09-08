import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import SessionProvider from '@/providers/SessionProvider';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import './globals.scss';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'Simulations - Business Case Studies',
  description: 'GenAI-powered business case study simulations for university students',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <NotificationProvider>
            <>
              <NotificationWrapper />
              {children}
            </>
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
