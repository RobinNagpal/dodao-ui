'use client';

import Authpage from '@/components/auth/AuthenticationPage';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

export default function Authenticate() {
  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <Authpage />
      </div>
    </PageWrapper>
  );
}
