import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { NotificationProvider } from '@dodao/web-core/ui/contexts/NotificationContext';
import { NotificationWrapper } from '@dodao/web-core/components/layout/NotificationWrapper';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Simulations - Business Case Studies',
  description: 'GenAI-powered business case study simulations for university students',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <NotificationProvider>
          <>
            <NotificationWrapper />
            {children}
          </>
        </NotificationProvider>
      </body>
    </html>
  );
}
