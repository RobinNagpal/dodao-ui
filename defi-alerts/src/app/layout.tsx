import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.scss';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import Navbar from '@/components/Navbar';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <NotificationProvider>
          <>
            <NotificationWrapper />
            <Navbar />
            {children}
          </>
        </NotificationProvider>
      </body>
    </html>
  );
}
