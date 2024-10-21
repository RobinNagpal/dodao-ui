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
        className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Contact Us
      </button>
    </div>
  );
}
