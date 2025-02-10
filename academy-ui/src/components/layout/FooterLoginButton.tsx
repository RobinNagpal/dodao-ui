import { SpaceProps } from '@/types/SpaceProps';
import EmailLoginModal from '@dodao/web-core/ui/auth/login/components/EmailLoginModal';
import { useState } from 'react';

export default function FooterLoginButton({ space }: SpaceProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <div className="text-sm text-gray-400 hover:text-gray-900 cursor-pointer underline" onClick={() => setShowLoginModal(true)}>
        Login
      </div>
      ?{showLoginModal && <EmailLoginModal space={space} open={showLoginModal} onClose={() => setShowLoginModal(false)} showSemiTransparentBg={true} />}
    </>
  );
}
