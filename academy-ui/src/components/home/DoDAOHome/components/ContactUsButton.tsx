'use client';
import ContactModal from './ContactModal';
import { useState } from 'react';

export default function ContactUsButton() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div className="flex justify-center text-center align-center mt-4">
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
      <button
        onClick={() => setShowContactModal(true)}
        className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Contact Us
      </button>
    </div>
  );
}
