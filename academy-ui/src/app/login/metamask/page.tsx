import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import LoginLogoutWithMetamask from '@/app/login/metamask/LoginLogoutWithMetamask';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import React from 'react';

export default async function LoginWithMetamask() {
  const space = await getSpaceServerSide();
  const session = (await getServerSession(authOptions)) as Session | null;
  return (
    <PageWrapper>
      <div className="flex justify-center align-center w-full min-h-screen">
        <LoginLogoutWithMetamask session={session} space={space!} />
      </div>
    </PageWrapper>
  );
}
