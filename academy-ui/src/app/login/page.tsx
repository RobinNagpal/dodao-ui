import LoginLogoutButtons from '@/app/login/LoginLogoutButtons';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import React from 'react';

async function LoginPage() {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const space = await getSpaceServerSide();

  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <LoginLogoutButtons session={session} space={space!} />
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
