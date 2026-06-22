'use client';

import { TickerNotesResponse } from '@/app/api/[spaceId]/users/ticker-notes/route';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { FavouriteTickerResponse, UserListResponse, UserTickerTagResponse } from '@/types/ticker-user';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Notes } from '@prisma/client';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Same dynamic chunks used by the desktop buttons — Next.js only fetches each
// once, so loading them here adds no bundle cost when desktop buttons render.
const AddEditFavouriteModal = dynamic(() => import('@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal'), { ssr: false });
const ManageListsModal = dynamic(() => import('@/components/favourites/ManageListsModal'), { ssr: false });
const ManageTagsModal = dynamic(() => import('@/components/favourites/ManageTagsModal'), { ssr: false });
const AddEditNotesModal = dynamic(() => import('@/app/stocks/[exchange]/[ticker]/AddEditNotesModal'), { ssr: false });
const ComparisonModal = dynamic(() => import('@/app/stocks/[exchange]/[ticker]/ComparisonModal'), { ssr: false });
const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

export interface MobileStockActionsMenuProps {
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
  tickerIndustryKey: string;
  tickerSubIndustryKey: string;
  tickerIndustryName: string;
  tickerSubIndustryName: string;
}

type FavouriteManageView = 'manage-lists' | 'manage-tags' | null;

export default function MobileStockActionsMenu({
  tickerId,
  tickerSymbol,
  tickerName,
  tickerIndustryKey,
  tickerSubIndustryKey,
  tickerIndustryName,
  tickerSubIndustryName,
}: MobileStockActionsMenuProps): JSX.Element {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const [isFavouriteOpen, setIsFavouriteOpen] = useState(false);
  const [favouriteMounted, setFavouriteMounted] = useState(false);
  const [favouriteManageView, setFavouriteManageView] = useState<FavouriteManageView>(null);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesMounted, setNotesMounted] = useState(false);

  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonMounted, setComparisonMounted] = useState(false);

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

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

  const lists = listsData?.lists || [];
  const tags = tagsData?.tags || [];
  const favouriteTicker = favouritesData?.favouriteTickers.find((f) => f.tickerId === tickerId) || null;
  const existingNote: TickerV1Notes | null = notesData?.tickerNotes.find((n) => n.tickerId === tickerId) || null;

  const items: EllipsisDropdownItem[] = [
    { key: 'favourite', label: favouriteTicker ? 'Edit favourite' : 'Add to favourites' },
    { key: 'notes', label: existingNote ? 'Edit note' : 'Add note' },
    { key: 'compare', label: 'Compare with others' },
  ];

  const handleSelect = (key: string) => {
    if (key === 'favourite' || key === 'notes') {
      if (!session) {
        setIsLoginPopupOpen(true);
        return;
      }
    }
    if (key === 'favourite') {
      setFavouriteMounted(true);
      setIsFavouriteOpen(true);
    } else if (key === 'notes') {
      setNotesMounted(true);
      setIsNotesOpen(true);
    } else if (key === 'compare') {
      setComparisonMounted(true);
      setIsComparisonOpen(true);
    }
  };

  return (
    <div className="relative z-10">
      <EllipsisDropdown items={items} onSelect={handleSelect} className="px-2 py-2" />

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
            onManageLists={() => setFavouriteManageView('manage-lists')}
            onManageTags={() => setFavouriteManageView('manage-tags')}
            onSuccess={() => setIsFavouriteOpen(false)}
            favouriteTicker={favouriteTicker}
            onUpsert={refetchFavourites}
          />

          <ManageListsModal
            isOpen={favouriteManageView === 'manage-lists'}
            onClose={() => setFavouriteManageView(null)}
            lists={lists}
            onListsChange={refetchLists}
          />

          <ManageTagsModal isOpen={favouriteManageView === 'manage-tags'} onClose={() => setFavouriteManageView(null)} tags={tags} onTagsChange={refetchTags} />
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

      {comparisonMounted && (
        <ComparisonModal
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          currentTicker={{
            symbol: tickerSymbol,
            name: tickerName,
            industryKey: tickerIndustryKey,
            subIndustryKey: tickerSubIndustryKey,
            industryName: tickerIndustryName,
            subIndustryName: tickerSubIndustryName,
          }}
        />
      )}

      {!session && <LoginPopup open={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />}
    </div>
  );
}
