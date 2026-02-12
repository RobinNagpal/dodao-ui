'use client';

import { WebCoreSpace } from '@dodao/web-core/types/space';
// LoginModal.tsx
import { LoginButtons } from '@dodao/web-core/ui/auth/login/components/LoginButtons';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import EmailLoginModal from '@dodao/web-core/ui/auth/login/components/EmailLoginModal';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';

const LoginModal = ({ space }: { space: WebCoreSpace }) => {
  const { showLoginModal, setShowLoginModal } = useLoginModalContext();

  if (!showLoginModal) {
    return null;
  }

  if (space.id === PredefinedSpaces.TIDBITS_HUB) {
    return (
      <>
        {showLoginModal && (
          <EmailLoginModal
            space={space}
            open={showLoginModal}
            onClose={() => {
              setShowLoginModal(false);
            }}
            showSemiTransparentBg={true}
          />
        )}
      </>
    );
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
