'use client';

import { TickerNotesResponse } from '@/app/api/[spaceId]/users/ticker-notes/route';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { FavouriteTickerResponse, UserListResponse, UserTickerTagResponse } from '@/types/ticker-user';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { DocumentTextIcon as DocumentTextOutline, HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { DocumentTextIcon as DocumentTextSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { TickerV1Notes } from '@prisma/client';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Heavy modal chunks are dynamic-imported — they only download/mount after the
// user actually opens a modal (or, for `ManageListsModal` / `ManageTagsModal`,
// only after they click the "Manage" sub-action). Keeps the sub-page initial
// JS unchanged for crawlers and first paint.
const AddEditFavouriteModal = dynamic(() => import('@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal'), { ssr: false });
const AddEditNotesModal = dynamic(() => import('@/app/stocks/[exchange]/[ticker]/AddEditNotesModal'), { ssr: false });
const ManageListsModal = dynamic(() => import('@/components/favourites/ManageListsModal'), { ssr: false });
const ManageTagsModal = dynamic(() => import('@/components/favourites/ManageTagsModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface StockSubPageActionsProps {
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
}

type ManageModalView = 'manage-lists' | 'manage-tags';

export default function StockSubPageActions({ tickerId, tickerSymbol, tickerName }: StockSubPageActionsProps): JSX.Element {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const [isFavouriteOpen, setIsFavouriteOpen] = useState(false);
  const [favouriteMounted, setFavouriteMounted] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesMounted, setNotesMounted] = useState(false);
  const [manageModalView, setManageModalView] = useState<ManageModalView | null>(null);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  // De-duplicated fetches: the desktop buttons and the mobile dropdown share
  // the same data. Rendering both layouts in the DOM (one hidden via CSS)
  // would otherwise double the API calls on every load.
  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<{ favouriteTickers: FavouriteTickerResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites'
  );
  const { data: notesData, reFetchData: refetchNotes } = useFetchData<TickerNotesResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/ticker-notes`,
    { skipInitialFetch: !session },
    'Failed to fetch notes'
  );
  const { data: listsData, reFetchData: refetchLists } = useFetchData<{ lists: UserListResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-lists`,
    { skipInitialFetch: !session },
    'Failed to fetch lists'
  );
  const { data: tagsData, reFetchData: refetchTags } = useFetchData<{ tags: UserTickerTagResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-ticker-tags`,
    { skipInitialFetch: !session },
    'Failed to fetch tags'
  );

  const favouriteTicker: FavouriteTickerResponse | null = favouritesData?.favouriteTickers.find((f) => f.tickerId === tickerId) || null;
  const existingNote: TickerV1Notes | null = notesData?.tickerNotes.find((n) => n.tickerId === tickerId) || null;
  const lists: UserListResponse[] = listsData?.lists || [];
  const tags: UserTickerTagResponse[] = tagsData?.tags || [];

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
          className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
            favouriteTicker ? 'bg-blue-700 hover:bg-blue-600 border-blue-600 text-white' : 'bg-surface-2 hover:bg-surface-3 border-surface-3 text-heading'
          } border rounded-lg shadow-md`}
          title={!session ? 'Login to add to favourites' : favouriteTicker ? 'Edit favourite' : 'Add to favourites'}
        >
          {favouriteTicker ? (
            <HeartSolid className="w-5 h-5 mr-2 text-red-400" aria-hidden="true" />
          ) : (
            <HeartOutline className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          <span>Favourite</span>
        </button>
        <button
          onClick={openNotes}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
            existingNote ? 'bg-green-700 hover:bg-green-600 border-green-600 text-white' : 'bg-surface-2 hover:bg-surface-3 border-surface-3 text-heading'
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
          aria-label={favouriteTicker ? 'Edit favourite' : 'Add to favourites'}
          title={!session ? 'Login to add to favourites' : favouriteTicker ? 'Edit favourite' : 'Add to favourites'}
          className={`inline-flex items-center justify-center p-2 border rounded-lg shadow-md ${
            favouriteTicker ? 'bg-blue-700 hover:bg-blue-600 border-blue-600 text-white' : 'bg-surface-2 hover:bg-surface-3 border-surface-3 text-heading'
          }`}
        >
          {favouriteTicker ? <HeartSolid className="w-5 h-5 text-red-400" aria-hidden="true" /> : <HeartOutline className="w-5 h-5" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={openNotes}
          aria-label={existingNote ? 'Edit note' : 'Add note'}
          title={!session ? 'Login to add notes' : existingNote ? 'Edit note' : 'Add note'}
          className={`inline-flex items-center justify-center p-2 border rounded-lg shadow-md ${
            existingNote ? 'bg-green-700 hover:bg-green-600 border-green-600 text-white' : 'bg-surface-2 hover:bg-surface-3 border-surface-3 text-heading'
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
        <>
          <AddEditFavouriteModal
            isOpen={isFavouriteOpen}
            onClose={() => setIsFavouriteOpen(false)}
            tickerId={tickerId}
            tickerSymbol={tickerSymbol}
            tickerName={tickerName}
            lists={lists}
            tags={tags}
            onManageLists={() => setManageModalView('manage-lists')}
            onManageTags={() => setManageModalView('manage-tags')}
            onSuccess={() => setIsFavouriteOpen(false)}
            favouriteTicker={favouriteTicker}
            onUpsert={refetchFavourites}
          />
          <ManageListsModal isOpen={manageModalView === 'manage-lists'} onClose={() => setManageModalView(null)} lists={lists} onListsChange={refetchLists} />
          <ManageTagsModal isOpen={manageModalView === 'manage-tags'} onClose={() => setManageModalView(null)} tags={tags} onTagsChange={refetchTags} />
        </>
      )}

      {session && notesMounted && (
        <AddEditNotesModal
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          tickerId={tickerId}
          tickerSymbol={tickerSymbol}
          tickerName={tickerName}
          onSuccess={() => setIsNotesOpen(false)}
          existingNote={existingNote}
          onUpsert={refetchNotes}
        />
      )}

      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </div>
  );
}
