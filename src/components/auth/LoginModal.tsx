// LoginModal.tsx
import { LoginButtons } from '@/app/login/components/LoginButtons';
import SingleSectionModal from '@/components/core/modals/SingleSectionModal';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

const LoginModal: React.FC = () => {
  const { showModal, setShowModal } = useLoginModalContext();
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      setShowModal(false);
    }
  }, [data, setShowModal]);

  if (!showModal) {
    return null;
  }

  return (
    <SingleSectionModal open={showModal} onClose={() => setShowModal(false)} title={'Login'} showCloseButton={false}>
      <LoginButtons />
    </SingleSectionModal>
  );
};

export default LoginModal;
