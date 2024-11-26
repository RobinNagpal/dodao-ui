import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { SortByteCollectionsRequest } from '@/types/request/ByteCollectionRequests';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './SortByteCollectionsModal.module.scss';

interface SortByteCollectionsModalProps {
  space: SpaceWithIntegrationsDto;
  byteCollections: ByteCollectionSummary[];
  onClose: () => void;
}

function SortableGridItem({ collection, index }: { collection: ByteCollectionSummary; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.sortItem} cursor-grab active:cursor-grabbing p-4 rounded shadow flex justify-between`}
    >
      <div className="text-left">
        <h3 className="text-sm font-medium">{collection.name}</h3>
        <p className="text-xs text-gray-500">{collection.archive ? 'Archived' : 'Active'}</p>
      </div>
      <div>{index + 1}</div>
    </div>
  );
}

export default function SortByteCollectionsModal(props: SortByteCollectionsModalProps) {
  const { space, byteCollections, onClose } = props;

  const [collections, setCollections] = useState<ByteCollectionSummary[]>(byteCollections);
  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';

  const { loading, postData } = usePostData(
    {
      successMessage: 'Tidbit Collections sorted successfully',
      errorMessage: 'Failed to sort tidbit Collections',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    {}
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = collections.findIndex((collection) => collection.id === active.id);
      const newIndex = collections.findIndex((collection) => collection.id === over.id);
      const newCollections = arrayMove(collections, oldIndex, newIndex);

      // Update the `order` property based on the new position
      newCollections.forEach((collection, index) => {
        collection.order = index + 1;
      });

      setCollections(newCollections);
    }
  };

  async function handleSave() {
    const request: SortByteCollectionsRequest = collections.map((collection) => ({
      byteCollectionId: collection.id,
      order: collection.order,
    }));

    await postData(`${getBaseUrl()}/api/${space.id}/actions/byte-collections/sort-collections`, request);
    onClose();
  }

  return (
    <FullScreenModal open={true} onClose={props.onClose} title="Sort Tidbit Collections">
      <PageWrapper>
        <div className="flex justify-center items-center">
          <div className="max-w-2xl w-full">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold">Sort Tidbit Collections</h1>
                  <p className="mt-2 text-sm">Drag and drop to reorder collections. Lower-order collections appear first in the list.</p>
                </div>
              </div>
              <div className="mt-8">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={collections.map((collection) => collection.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 gap-2">
                      {collections.map((collection, index) => (
                        <SortableGridItem key={collection.id} collection={collection} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
            <div className="w-full flex justify-center my-6">
              <Button primary={true} variant="contained" onClick={handleSave} disabled={loading} loading={loading}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    </FullScreenModal>
  );
}
