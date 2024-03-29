'use client';

// LoginModal.tsx
import { LoginButtons } from '@/app/login/components/LoginButtons';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import SingleSectionModal from '@/components/core/modals/SingleSectionModal';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

const LoginModal: React.FC = () => {
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
    <FullScreenModal open={showLoginModal} onClose={() => setShowLoginModal(false)} title={'Login'} showCloseButton={false}>
      <PageWrapper>
        <div className="flex justify-center items-center h-full">
          <LoginButtons onCloseEmailModal={() => setShowLoginModal(false)} />
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
};

export default LoginModal;
