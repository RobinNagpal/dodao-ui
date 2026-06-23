'use client';

import { EtfNotesResponse } from '@/app/api/[spaceId]/users/etf-notes/route';
import { KoalaGainsSession } from '@/types/auth';
import { FavouriteEtfResponse, FavouriteEtfsResponse } from '@/types/etf-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { DocumentTextIcon as DocumentTextOutline, HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { DocumentTextIcon as DocumentTextSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { EtfNote } from '@prisma/client';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Heavy modal chunks are dynamic-imported — they only download/mount after the
// user actually opens a modal. Keeps the sub-page initial JS unchanged for
// crawlers and first paint.
const AddEditEtfFavouriteModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfFavouriteModal'), { ssr: false });
const AddEditEtfNotesModal = dynamic(() => import('@/app/etfs/[exchange]/[etf]/AddEditEtfNotesModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface EtfSubPageActionsProps {
  etfId: string;
  etfSymbol: string;
  etfName: string;
}

export default function EtfSubPageActions({ etfId, etfSymbol, etfName }: EtfSubPageActionsProps): JSX.Element {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const [isFavouriteOpen, setIsFavouriteOpen] = useState(false);
  const [favouriteMounted, setFavouriteMounted] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesMounted, setNotesMounted] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  // De-duplicated fetches: the desktop buttons and the mobile dropdown share
  // the same data. Rendering both layouts in the DOM (one hidden via CSS)
  // would otherwise double the API calls on every load.
  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<FavouriteEtfsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites'
  );
  const { data: notesData, reFetchData: refetchNotes } = useFetchData<EtfNotesResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/etf-notes`,
    { skipInitialFetch: !session },
    'Failed to fetch notes'
  );

  const favouriteEtf: FavouriteEtfResponse | null = favouritesData?.favouriteEtfs.find((f) => f.etfId === etfId) || null;
  const existingNote: EtfNote | null = notesData?.etfNotes.find((n) => n.etfId === etfId) || null;

  const openFavourite = () => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    setFavouriteMounted(true);
    setIsFavouriteOpen(true);
  };

  const openNotes = () => {
    if (!session) {
      setIsLoginPopupOpen(true);
      return;
    }
    setNotesMounted(true);
    setIsNotesOpen(true);
  };

  return (
    <div className="flex items-center gap-2 relative z-10">
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        <button
          onClick={openFavourite}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white ${
            favouriteEtf ? 'bg-blue-700 hover:bg-blue-600 border-blue-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
          } border rounded-lg shadow-md`}
          title={!session ? 'Login to add to favourites' : favouriteEtf ? 'Edit favourite' : 'Add to favourites'}
        >
          {favouriteEtf ? (
            <HeartSolid className="w-5 h-5 mr-2 text-red-400" aria-hidden="true" />
          ) : (
            <HeartOutline className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          <span>Favourite</span>
        </button>
        <button
          onClick={openNotes}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white ${
            existingNote ? 'bg-green-700 hover:bg-green-600 border-green-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
          } border rounded-lg shadow-md`}
          title={!session ? 'Login to add notes' : existingNote ? 'Edit note' : 'Add note'}
        >
          {existingNote ? (
            <DocumentTextSolid className="w-5 h-5 mr-2 text-green-300" aria-hidden="true" />
          ) : (
            <DocumentTextOutline className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          <span>Notes</span>
        </button>
      </div>

      {/* Inline icon actions (mobile) — surfaced directly instead of hidden in a
          3-dot menu so logged-out visitors are more likely to tap and hit the
          login prompt. Same handlers/modals as the desktop buttons above. */}
      <div className="flex items-center gap-1.5 sm:hidden">
        <button
          type="button"
          onClick={openFavourite}
          aria-label={favouriteEtf ? 'Edit favourite' : 'Add to favourites'}
          title={!session ? 'Login to add to favourites' : favouriteEtf ? 'Edit favourite' : 'Add to favourites'}
          className={`inline-flex items-center justify-center p-2 text-white border rounded-lg shadow-md ${
            favouriteEtf ? 'bg-blue-700 hover:bg-blue-600 border-blue-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
          }`}
        >
          {favouriteEtf ? <HeartSolid className="w-5 h-5 text-red-400" aria-hidden="true" /> : <HeartOutline className="w-5 h-5" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={openNotes}
          aria-label={existingNote ? 'Edit note' : 'Add note'}
          title={!session ? 'Login to add notes' : existingNote ? 'Edit note' : 'Add note'}
          className={`inline-flex items-center justify-center p-2 text-white border rounded-lg shadow-md ${
            existingNote ? 'bg-green-700 hover:bg-green-600 border-green-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
          }`}
        >
          {existingNote ? (
            <DocumentTextSolid className="w-5 h-5 text-green-300" aria-hidden="true" />
          ) : (
            <DocumentTextOutline className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {session && favouriteMounted && (
        <AddEditEtfFavouriteModal
          isOpen={isFavouriteOpen}
          onClose={() => setIsFavouriteOpen(false)}
          etfId={etfId}
          etfSymbol={etfSymbol}
          etfName={etfName}
          onSuccess={() => setIsFavouriteOpen(false)}
          favouriteEtf={favouriteEtf}
          onUpsert={refetchFavourites}
        />
      )}

      {session && notesMounted && (
        <AddEditEtfNotesModal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          etfId={etfId}
          etfSymbol={etfSymbol}
          etfName={etfName}
          onSuccess={() => setIsNotesOpen(false)}
          existingNote={existingNote}
          onUpsert={refetchNotes}
        />
      )}

      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </div>
  );
}
