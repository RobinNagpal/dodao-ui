import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import StyledComponentsRegistry from '@/utils/StyledComponentsRegistry';
import { getServerSession } from 'next-auth';
import './globals.css';
import 'tailwindcss/tailwind.css';
import InternalLayout from './InternalLayout';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions);
  console.log('session', session);

  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <StyledComponentsRegistry>
          <InternalLayout session={session}>{children}</InternalLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
