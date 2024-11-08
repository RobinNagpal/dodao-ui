'use client';
import ContactModal from './ContactModal';
import { useState } from 'react';

export default function ContactUsLink() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div className="flex justify-center text-center align-center">
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
      <div className="text-blue-600 hover:text-blue-800 cursor-pointer underline" onClick={() => setShowContactModal(true)}>
        Contact Us
      </div>
    </div>
  );
}
