'use client';

import { KoalaGainsSession } from '@/types/auth';
import { DocumentTextIcon as DocumentTextOutline } from '@heroicons/react/24/outline';
import { DocumentTextIcon as DocumentTextSolid } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { EtfNotesResponse } from '@/app/api/[spaceId]/users/etf-notes/route';
import { EtfNote } from '@prisma/client';

// Modal only opens when the user clicks Notes — defer its chunk.
const AddEditEtfNotesModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfNotesModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface EtfNotesButtonProps {
  etfId: string;
  etfSymbol: string;
  etfName: string;
}

export default function EtfNotesButton({ etfId, etfSymbol, etfName }: EtfNotesButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasMountedModal, setHasMountedModal] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  // Fetch ETF notes
  const { data: notesData, reFetchData: refetchNotes } = useFetchData<EtfNotesResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/etf-notes`,
    { skipInitialFetch: !session },
    'Failed to fetch notes'
  );

  const existingNote: EtfNote | null = notesData?.etfNotes.find((n) => n.etfId === etfId) || null;

  const handleNotesClick = () => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    setHasMountedModal(true);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  const handleUpsert = async () => {
    await refetchNotes();
  };

  return (
    <div className="flex-shrink-0 relative z-10">
      <button
        onClick={handleNotesClick}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white ${
          existingNote ? 'bg-green-700 hover:bg-green-600 border-green-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
        } border rounded-lg shadow-md relative z-10`}
        title={!session ? 'Login to add notes' : existingNote ? 'Edit note' : 'Add note'}
      >
        {existingNote ? (
          <DocumentTextSolid className="w-5 h-5 mr-2 text-green-300" aria-hidden="true" />
        ) : (
          <DocumentTextOutline className="w-5 h-5 mr-2" aria-hidden="true" />
        )}
        <span>Notes</span>
      </button>
      {session && hasMountedModal && (
        <AddEditEtfNotesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          etfId={etfId}
          etfSymbol={etfSymbol}
          etfName={etfName}
          onSuccess={handleSuccess}
          existingNote={existingNote}
          onUpsert={handleUpsert}
        />
      )}
      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </div>
  );
}
