import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import StyledComponentsRegistry from '@/utils/StyledComponentsRegistry';
import { Analytics } from '@vercel/analytics/react';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import 'tailwindcss/tailwind.css';
import './globals.scss';
import InternalLayout from './InternalLayout';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = (await getServerSession(authOptions)) as Session | null;

  const reqHeaders = headers();

  console.log('reqHeaders', reqHeaders);
  console.log('reqHeaders', reqHeaders.get('host')!);
  const response = await axios.get(process.env.V2_API_SERVER_URL?.replace('/graphql', '') + '/extended-space', {
    params: {
      domain: reqHeaders.get('host')!,
    },
  });
  console.log('response', response.data);
  return (
    <html lang="en" className="h-full">
      <body className="max-h-screen">
        <StyledComponentsRegistry>
          <InternalLayout session={session as Session} space={response?.data as SpaceWithIntegrationsFragment} spaceError={response.status !== 200}>
            {children}
          </InternalLayout>
        </StyledComponentsRegistry>
        <Analytics />
      </body>
    </html>
  );
}
