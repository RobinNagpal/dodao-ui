import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@/types/auth/Session';
import StyledComponentsRegistry from '@/utils/StyledComponentsRegistry';
import { getServerSession } from 'next-auth';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import InternalLayout from './InternalLayout';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full">
      <body className="max-h-screen">
        <StyledComponentsRegistry>
          <InternalLayout session={session as Session}>{children}</InternalLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
