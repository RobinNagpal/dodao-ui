import AddByteCollection from '@/components/byteCollection/ByteCollections/AddByteCollection';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Grid2Cols } from '@dodao/web-core/components/core/grids/Grid2Cols';
import ArchiveToggle from '@/components/byteCollection/View/ArchiveToggle';

export default function ByteCollectionsGrid({
  byteCollections,
  space,
  byteCollectionsBaseUrl,
  isAdmin,
  archive,
}: {
  byteCollections?: ByteCollectionSummary[];
  space: SpaceWithIntegrationsDto;
  byteCollectionsBaseUrl: string;
  isAdmin?: boolean | undefined;
  archive?: boolean;
}) {
  const byteCollectionsList = archive ? byteCollections : byteCollections?.filter((byteCollection) => !byteCollection.archive);
  return (
    <>
      {isAdmin! && <AddByteCollection space={space} />}
      {isAdmin! && <ArchiveToggle archive={archive} />}
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
              showArchived={archive}
            />
          ))}
        </Grid2Cols>
      )}
    </>
  );
}
