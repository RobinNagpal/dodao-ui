'use client';

import ButtonLarge from '@/components/core/button/ButtonLarge';
import SingleSectionModal from '@/components/core/modal/SingleSectionModal';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { coinbaseWallet } from './connectors/coinbaseWallet';
import { metaMask } from './connectors/metaMask';

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const { data, status } = useSession();
  return (
    <div>
      {showModal && (
        <SingleSectionModal open={showModal} onClose={() => setShowModal(false)} title={'Login'}>
          <div className="flex-col">
            <ButtonLarge onClick={() => metaMask.activate()} primary className="mt-2 w-full">
              Metamask
            </ButtonLarge>
            <ButtonLarge onClick={() => coinbaseWallet.activate()} primary className="mt-2 w-full">
              Coinbase
            </ButtonLarge>
          </div>
        </SingleSectionModal>
      )}
      <ButtonLarge onClick={() => setShowModal(true)} primary>
        Show Login Modal
      </ButtonLarge>
      <div className="mt-2">{JSON.stringify(data || {})}</div>
      <div className="mt-2">{status}</div>
    </div>
  );
}
