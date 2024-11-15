import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { ByteCollectionItem, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SortByteCollectionItemsRequest } from '@/types/request/ByteCollectionRequests';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

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
export default function SortByteCollectionItemsModal(props: SortByteCollectionItemsModalProps) {
  const { space, byteCollection, onClose } = props;

  const [items, setItems] = useState<ByteCollectionItem[]>(filterArchivedItems(byteCollection.items || []));
  const [error, setError] = useState<string | null>(null);
  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';

  const { loading, postData } = usePostData(
    {
      successMessage: 'Items sorted successfully',
      errorMessage: 'Failed to sort items',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    {}
  );

  function handleOrderChange(index: number, order: number) {
    const newItems = [...items];
    newItems[index].order = order;
    setItems(newItems);
  }

  async function handleSave() {
    setError(null);
    const orderNumbers = new Set<number>();
    for (const item of items) {
      if (orderNumbers.has(item.order)) {
        setError('Order numbers must be unique');
      }
      orderNumbers.add(item.order);
    }

    if (error) {
      return;
    }

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
        <div className="flex justify-center align-center">
          <div className="max-w-4xl">
            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold">Sort Byte Collection Items</h1>
                  <p className="mt-2 text-sm">Specify the order number for displaying items. Items with a lower order number appear first in the list.</p>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-3">
                            Item Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
                            Item Type
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold ">
                            Order
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-left">
                        {items.map((item: ByteCollectionItem, index) => {
                          return (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-2 pl-2 pr-3 text-sm font-medium sm:pl-2">{getItemName(item)}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm">{item.type}</td>

                              <td className="whitespace-nowrap px-3 py-2 text-sm">
                                <Input
                                  number={true}
                                  modelValue={item.order?.toString() || '0'}
                                  className="w-24"
                                  onUpdate={(value) => handleOrderChange(index, value as number)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">{error && <p className="text-red-500">{error}</p>}</div>
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
