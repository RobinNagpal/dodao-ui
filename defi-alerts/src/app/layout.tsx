import Navbar from '@/components/Navbar';
import SessionProvider from '@/providers/SessionProvider';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import './globals.scss';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'DeFi Alerts',
  description: 'DeFi Alerts',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  // Redirect to login if not logged in
  if (!session) {
    // We need to exclude the login page to avoid redirect loops
    const headersList = await headers();
    const path = headersList?.get('x-current-path') || '';
    console.log('path', path);

    if (path !== '/login' && path !== '/auth/email/verify') {
      console.log(`User is not logged in, redirecting to login page: ${path}`);
      redirect('/login');
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <SessionProvider session={session}>
          <NotificationProvider>
            <>
              <NotificationWrapper />
              <Navbar />
              {children}
            </>
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
