'use client';
import ContactModal from './ContactModal';
import { useState } from 'react';

export default function ContactUsLink() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div className="flex justify-center text-center align-center">
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
      <div className="text-gray-900 cursor-pointer hover:underline" onClick={() => setShowContactModal(true)}>
        Contact Us <span aria-hidden="true">→</span>
      </div>
    </div>
  );
}
