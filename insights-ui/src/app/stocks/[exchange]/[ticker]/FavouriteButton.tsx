'use client';

import AddEditFavouriteModal from '@/app/stocks/[exchange]/[ticker]/AddEditFavouriteModal';
import { KoalaGainsSession } from '@/types/auth';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { FavouriteTickerResponse, UserListResponse, UserTickerTagResponse } from '@/types/ticker-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ManageListsModal from '@/components/favourites/ManageListsModal';
import ManageTagsModal from '@/components/favourites/ManageTagsModal';

export interface FavouriteButtonProps {
  tickerId: string;
  tickerSymbol: string;
  tickerName: string;
}

type ModalView = 'manage-lists' | 'manage-tags';

export default function FavouriteButton({ tickerId, tickerSymbol, tickerName }: FavouriteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manageModalView, setManageModalView] = useState<ModalView | null>(null);
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();

  // Fetch lists and tags
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

  // Fetch favourite tickers
  const { data: favouritesData, reFetchData: refetchFavourites } = useFetchData<{ favouriteTickers: FavouriteTickerResponse[] }>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`,
    { skipInitialFetch: !session },
    'Failed to fetch favourites'
  );

  const lists = listsData?.lists || [];
  const tags = tagsData?.tags || [];

  const favouriteTicker = favouritesData?.favouriteTickers.find((f) => f.tickerId === tickerId) || null;

  const handleFavouriteClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    // Modal will handle the success feedback
    setIsModalOpen(false);
  };

  const handleUpsert = async () => {
    await refetchFavourites();
  };

  const handleListsChange = async () => {
    await refetchLists();
  };

  const handleTagsChange = async () => {
    await refetchTags();
  };

  return (
    <div className="flex-shrink-0 relative z-10">
      <button
        onClick={handleFavouriteClick}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white ${
          favouriteTicker ? 'bg-blue-700 hover:bg-blue-600 border-blue-600' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
        } border rounded-lg shadow-md relative z-10`}
        title={!session ? 'Login to add to favourites' : favouriteTicker ? 'Edit favourite' : 'Add to favourites'}
      >
        {favouriteTicker ? (
          <HeartSolid className="w-5 h-5 mr-2 text-red-400" aria-hidden="true" />
        ) : (
          <HeartOutline className="w-5 h-5 mr-2" aria-hidden="true" />
        )}
        <span>Favourite</span>
      </button>
      {session && (
        <>
          <AddEditFavouriteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            tickerId={tickerId}
            tickerSymbol={tickerSymbol}
            tickerName={tickerName}
            lists={lists}
            tags={tags}
            onManageLists={() => setManageModalView('manage-lists')}
            onManageTags={() => setManageModalView('manage-tags')}
            onSuccess={handleSuccess}
            favouriteTicker={favouriteTicker}
            onUpsert={handleUpsert}
          />

          {/* Manage Modals */}
          <ManageListsModal
            isOpen={manageModalView === 'manage-lists'}
            onClose={() => setManageModalView(null)}
            lists={lists}
            onListsChange={handleListsChange}
          />

          <ManageTagsModal isOpen={manageModalView === 'manage-tags'} onClose={() => setManageModalView(null)} tags={tags} onTagsChange={handleTagsChange} />
        </>
      )}
    </div>
  );
}
