import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { ByteCollectionItem, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SortByteCollectionItemsRequest } from '@/types/request/ByteCollectionRequests';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';
import styles from './SortByteCollectionItemsModal.module.scss';

interface SortByteCollectionItemsModalProps {
  space: SpaceWithIntegrationsDto;
  byteCollection: ByteCollectionSummary;
  onClose: () => void;
}

const getItemName = (item: ByteCollectionItem) => {
  switch (item.type) {
    case ByteCollectionItemType.Byte:
      return item.byte.name;
    case ByteCollectionItemType.ClickableDemo:
      return item.demo.title;
    case ByteCollectionItemType.ShortVideo:
      return item.short.title;
  }
};

const getItemIdAndType = (item: ByteCollectionItem) => {
  switch (item.type) {
    case ByteCollectionItemType.Byte:
      return { itemId: item.byte.byteId, itemType: item.type };
    case ByteCollectionItemType.ClickableDemo:
      return { itemId: item.demo.demoId, itemType: item.type };
    case ByteCollectionItemType.ShortVideo:
      return { itemId: item.short.shortId, itemType: item.type };
  }
};

const filterArchivedItems = (items: ByteCollectionItem[]) => {
  return items.filter((item) => {
    switch (item.type) {
      case ByteCollectionItemType.Byte:
        return !item.byte.archive;
      case ByteCollectionItemType.ClickableDemo:
        return !item.demo.archive;
      case ByteCollectionItemType.ShortVideo:
        return !item.short.archive;
    }
  });
};

function SortableGridItem({ item }: { item: ByteCollectionItem }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: getItemIdAndType(item).itemId });

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
      className={`${styles.sortItem} cursor-grab active:cursor-grabbing bg-white p-4 rounded shadow`}
    >
      <h3 className="text-sm font-medium">{getItemName(item)}</h3>
      <p className="text-xs text-gray-500">{item.type === ByteCollectionItemType.Byte ? 'Tidbit' : item.type}</p>
    </div>
  );
}

export default function SortByteCollectionItemsModal(props: SortByteCollectionItemsModalProps) {
  const { space, byteCollection, onClose } = props;

  const [items, setItems] = useState<ByteCollectionItem[]>(filterArchivedItems(byteCollection.items || []));
  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';

  const { loading, postData } = usePostData(
    {
      successMessage: 'Items sorted successfully',
      errorMessage: 'Failed to sort items',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    {}
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getItemIdAndType(item).itemId === active.id);
      const newIndex = items.findIndex((item) => getItemIdAndType(item).itemId === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update the `order` property based on the new position
      newItems.forEach((item, index) => {
        item.order = index + 1;
      });

      setItems(newItems);
    }
  };

  async function handleSave() {
    const request: SortByteCollectionItemsRequest = {
      newItemIdAndOrders: items.map((item) => {
        const itemIdAndType = getItemIdAndType(item);
        return {
          itemId: itemIdAndType.itemId,
          itemType: itemIdAndType.itemType,
          order: item.order,
        };
      }),
    };

    await postData(`${getBaseUrl()}/api/${space.id}/actions/byte-collections/${byteCollection.id}/sort-items`, request);
    onClose();
  }

  return (
    <FullScreenModal open={true} onClose={props.onClose} title={`Sort Items in - ${byteCollection.name}`}>
      <PageWrapper>
        <div className="flex justify-center items-center">
          <div className="max-w-4xl w-full">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold">Sort Tidbit Collection Items</h1>
                  <p className="mt-2 text-sm">Drag and drop to reorder items. Lower-order items appear first in the list.</p>
                </div>
              </div>
              <div className="mt-8">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={items.map((item) => getItemIdAndType(item).itemId)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <SortableGridItem key={getItemIdAndType(item).itemId} item={item} />
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
