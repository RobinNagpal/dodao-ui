'use client';

import AddEditNotesModal from '@/app/stocks/[exchange]/[ticker]/AddEditNotesModal';
import { KoalaGainsSession } from '@/types/auth';
import { DocumentTextIcon as DocumentTextOutline } from '@heroicons/react/24/outline';
import { DocumentTextIcon as DocumentTextSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerNotesResponse } from '@/app/api/[spaceId]/users/ticker-notes/route';
import { TickerV1Notes } from '@prisma/client';

export interface NotesButtonProps {
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
}

export default function NotesButton({ tickerId, tickerSymbol, tickerName }: NotesButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();

  // Fetch ticker notes
  const { data: notesData, reFetchData: refetchNotes } = useFetchData<TickerNotesResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/ticker-notes`,
    { skipInitialFetch: !session },
    'Failed to fetch notes'
  );

  const existingNote: TickerV1Notes | null = notesData?.tickerNotes.find((n) => n.tickerId === tickerId) || null;

  const handleNotesClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
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
      {session && (
        <AddEditNotesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tickerId={tickerId}
          tickerSymbol={tickerSymbol}
          tickerName={tickerName}
          onSuccess={handleSuccess}
          existingNote={existingNote}
          onUpsert={handleUpsert}
        />
      )}
    </div>
  );
}
