// LoginModal.tsx
import { LoginButtons } from '@/app/login/components/LoginButtons';
import SingleSectionModal from '@/components/core/modals/SingleSectionModal';
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
    <SingleSectionModal open={showLoginModal} onClose={() => setShowLoginModal(false)} title={'Login'} showCloseButton={false}>
      <LoginButtons />
    </SingleSectionModal>
  );
};

export default LoginModal;
