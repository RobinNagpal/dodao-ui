// LoginModal.tsx
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import NewWindow from 'react-new-window';

// based on this snippet from https://github.com/nextauthjs/next-auth/issues/178#issuecomment-757513968
export default function LoginModal({ sessionCounter, setSessionCounter }: { sessionCounter: number; setSessionCounter: (counter: number) => void }) {
  const { showModal, setShowModal } = useLoginModalContext();
  const { data, update } = useSession();

  const reloadSession = () => {
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  };

  useEffect(() => {
    if (data) {
      setShowModal(false);
    }

    console.log(data, 'data');
  }, [data, setShowModal]);

  if (!showModal) {
    return null;
  }

  const onUnload = async () => {
    // setShowModal(false);
    console.log('trigger session update', data);
    await update();
    setSessionCounter(sessionCounter + 1);
    setTimeout(() => {
      reloadSession();
    }, 1000);
    console.log('session updated', data);
  };

  return showModal && <NewWindow url="/sign-in" onUnload={() => onUnload()} />;
}
