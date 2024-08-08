import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import LoginLogoutButtons from '@/app/login/LoginLogoutButtons';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import React from 'react';

async function LoginPage() {
  const space = await getSpaceServerSide();
  const session = (await getServerSession(authOptions)) as Session | null;

  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <LoginLogoutButtons session={session} space={space!} />
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
