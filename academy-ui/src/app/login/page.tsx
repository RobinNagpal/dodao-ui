import { LoginLogoutButtons } from '@/app/login/loginLogoutButtons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import React from 'react';

async function LoginPage() {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;

  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <LoginLogoutButtons session={session} space={} />
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
