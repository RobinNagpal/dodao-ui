'use client';

import AddEditEtfFavouriteModal from '@/app/etfs/[exchange]/[etf]/AddEditEtfFavouriteModal';
import DeleteConfirmationModal from '@/app/admin-v1/industry-management/DeleteConfirmationModal';
import EtfFavouriteItem from '@/components/etf-favourites/EtfFavouriteItem';
import EtfFavouritesPageHeader from '@/components/etf-favourites/EtfFavouritesPageHeader';
import FavouritesEmptyState from '@/components/favourites/FavouritesEmptyState';
import FavouritesLoadingSkeleton from '@/components/favourites/FavouritesLoadingSkeleton';
import { KoalaGainsSession } from '@/types/auth';
import { FavouriteEtfResponse, FavouriteEtfsResponse } from '@/types/etf-user';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

export default function EtfFavouritesPage() {
  const { data: koalaSession } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const router = useRouter();

  const [editingFavourite, setEditingFavourite] = useState<FavouriteEtfResponse | null>(null);
  const [deletingFavourite, setDeletingFavourite] = useState<FavouriteEtfResponse | null>(null);

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (koalaSession === null) {
      router.push('/login');
    }
  }, [koalaSession, router]);

  const {
    data: favouritesData,
    loading: favouritesLoading,
    reFetchData: refetchFavourites,
  } = useFetchData<FavouriteEtfsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs`,
    { skipInitialFetch: !session },
    'Failed to fetch ETF favourites'
  );

  const { deleteData: deleteFavourite, loading: isDeleting } = useDeleteData({
    successMessage: 'Favourite deleted successfully!',
    errorMessage: 'Failed to delete favourite.',
  });

  // Sort by myScore desc, nulls last — matches the stock favourites page within each list.
  const favourites = useMemo<FavouriteEtfResponse[]>(() => {
    const items = favouritesData?.favouriteEtfs ?? [];
    return [...items].sort((a, b) => {
      const scoreA = a.myScore ?? -Infinity;
      const scoreB = b.myScore ?? -Infinity;
      return scoreB - scoreA;
    });
  }, [favouritesData]);

  if (favouritesLoading) {
    return (
      <PageWrapper>
        <FavouritesLoadingSkeleton />
      </PageWrapper>
    );
  }

  if (!session) {
    return null;
  }

  const handleDelete = async () => {
    if (!deletingFavourite) return;

    const result = await deleteFavourite(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-etfs/${deletingFavourite.id}`);
    if (result) {
      await refetchFavourites();
      setDeletingFavourite(null);
    }
  };

  const handleEditFavourite = (e: React.MouseEvent, fav: FavouriteEtfResponse) => {
    e.stopPropagation();
    setEditingFavourite(fav);
  };

  const handleDeleteFavourite = (e: React.MouseEvent, fav: FavouriteEtfResponse) => {
    e.stopPropagation();
    setDeletingFavourite(fav);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-1 sm:px-2">
        <div className="py-6">
          <div className="mb-8">
            <EtfFavouritesPageHeader favouritesCount={favourites.length} />
          </div>

          {favourites.length === 0 ? (
            <FavouritesEmptyState browseHref="/etfs" browseLabel="Browse ETFs" description="Start adding ETFs to your favourites and they'll show up here." />
          ) : (
            <div className="space-y-2 pb-12">
              {favourites.map((fav) => (
                <EtfFavouriteItem key={fav.id} favourite={fav} onEdit={handleEditFavourite} onDelete={handleDeleteFavourite} />
              ))}
            </div>
          )}
        </div>

        {editingFavourite && (
          <AddEditEtfFavouriteModal
            isOpen={!!editingFavourite}
            onClose={() => setEditingFavourite(null)}
            etfId={editingFavourite.etfId}
            etfSymbol={editingFavourite.etf.symbol}
            etfName={editingFavourite.etf.name}
            favouriteEtf={editingFavourite}
            onUpsert={async () => {
              await refetchFavourites();
              setEditingFavourite(null);
            }}
          />
        )}

        {deletingFavourite && (
          <DeleteConfirmationModal
            open={!!deletingFavourite}
            onClose={() => setDeletingFavourite(null)}
            onDelete={handleDelete}
            deleting={isDeleting}
            title={`Delete ${deletingFavourite.etf.symbol} from favourites?`}
            deleteButtonText="Delete Favourite"
            confirmationText="DELETE"
          />
        )}
      </div>
    </PageWrapper>
  );
}
