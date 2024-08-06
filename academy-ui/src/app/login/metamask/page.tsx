import LoginLogoutWithMetamask from '@/app/login/metamask/LoginLogoutWithMetamask';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import React from 'react';

export default async function LoginWithMetamask() {
  const space = await getSpaceServerSide();
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  return (
    <PageWrapper>
      <div className="flex justify-center align-center w-full min-h-screen">
        <LoginLogoutWithMetamask session={session} space={space!} />
      </div>
    </PageWrapper>
  );
}
