import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
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
  description:
    'Optimize every DeFi position with proactive alerts for higher yields, rewards, and inefficient positions across any chain or protocol. Get real-time notifications for market volatility, opportunity timing, and portfolio tracking.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const reqHeaders = await headers();
  const host = reqHeaders.get('host')?.split(':')?.[0];

  const isCompoundDomain = host === 'compound.defialerts-localhost.xyz' || host === 'compound.defialerts.xyz';

  if (isCompoundDomain && !session) {
    const path = reqHeaders?.get('x-current-path') || '';
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
