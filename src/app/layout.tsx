import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import StyledComponentsRegistry from '@/utils/StyledComponentsRegistry';
import { getServerSession } from 'next-auth';
import 'tailwindcss/tailwind.css';
import './globals.css';
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
          <InternalLayout session={session}>{children}</InternalLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
