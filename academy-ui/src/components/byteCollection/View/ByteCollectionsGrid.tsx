'use client';
import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  byteCollectionsBaseUrl,
  isAdmin,
}: {
  byteCollections?: ByteCollectionSummary[];
  space: SpaceWithIntegrationsDto;
  byteCollectionsBaseUrl: string;
  isAdmin?: boolean | undefined;
}) {
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const archived = searchParams.get('archive');

  const isArchived = archived === 'true' ? true : false;
  const byteCollectionsList = isArchived ? byteCollections : byteCollections?.filter((byteCollection) => !byteCollection.archive);
  const handleToggle = () => {
    const newRoute = `${currentPath}?archive=${!isArchived}`;
    router.push(newRoute);
  };
  return (
    <>
      {isAdmin! && <AddByteCollection space={space} />}
      {isAdmin! && (
        <div className="flex justify-end mb-2">
          <ToggleWithIcon label={'See Archived'} enabled={isArchived} setEnabled={handleToggle} />
        </div>
      )}
      {!byteCollectionsList?.length && !isAdmin && <NoByteCollections space={space} />}
      {!!byteCollectionsList?.length && (
        <Grid2Cols>
          {byteCollectionsList?.map((byteCollection, i) => (
            <ByteCollectionsCard
              key={i}
              byteCollection={byteCollection}
              viewByteBaseUrl={`${byteCollectionsBaseUrl}/view/${byteCollection.id}/`}
              space={space}
              isAdmin={isAdmin}
              showArchived={isArchived}
            />
          ))}
        </Grid2Cols>
      )}
    </>
  );
}
