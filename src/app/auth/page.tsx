'use client';

import ButtonLarge from '@/components/core/button/ButtonLarge';
import SingleSectionModal from '@/components/core/modal/SingleSectionModal';
import { useState } from 'react';

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'wrap',
        fontFamily: 'sans-serif',
      }}
    >
      {showModal && (
        <SingleSectionModal open={showModal} onClose={() => setShowModal(false)} title={'Login'}>
          <div className="flex-col">
            <ButtonLarge onClick={() => setShowModal(true)} primary className="mt-2 w-full">
              Metamask
            </ButtonLarge>
            <ButtonLarge onClick={() => setShowModal(true)} primary className="mt-2 w-full">
              Coinbase
            </ButtonLarge>
          </div>
        </SingleSectionModal>
      )}
      <ButtonLarge onClick={() => setShowModal(true)} primary>
        Show Login Modal
      </ButtonLarge>
    </div>
  );
}
