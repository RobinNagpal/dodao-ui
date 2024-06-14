'use client';

import { WebCoreSpace } from '@dodao/web-core/types/space';
// LoginModal.tsx
import { LoginButtons } from '@dodao/web-core/ui/auth/login/components/LoginButtons';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

const LoginModal = ({ space }: { space: WebCoreSpace }) => {
  const { showLoginModal, setShowLoginModal } = useLoginModalContext();
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      setShowLoginModal(false);
    }
  }, [data, setShowLoginModal]);

  if (!showLoginModal) {
    return null;
  }

  return (
    <FullScreenModal open={showLoginModal} onClose={() => setShowLoginModal(false)} title={'Login'} showCloseButton={true}>
      <PageWrapper>
        <div className="flex justify-center items-center h-full">
          <LoginButtons space={space} onCloseEmailModal={() => setShowLoginModal(false)} />
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
};

export default LoginModal;
