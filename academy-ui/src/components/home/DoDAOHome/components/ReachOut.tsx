'use client';

import ContactModal from './ContactModal';
import { useState } from 'react';

export default function ReachOut() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <>
      <span className="underline cursor-pointer" onClick={() => setShowContactModal(true)}>
        reach out to us
      </span>
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
    </>
  );
}
