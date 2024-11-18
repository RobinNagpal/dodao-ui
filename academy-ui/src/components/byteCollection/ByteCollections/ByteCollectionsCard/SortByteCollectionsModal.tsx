import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { SortByteCollectionsRequest } from '@/types/request/ByteCollectionRequests';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

interface SortByteCollectionsModalProps {
  space: SpaceWithIntegrationsDto;
  byteCollections: ByteCollectionSummary[];
  onClose: () => void;
}

export default function SortByteCollectionsModal(props: SortByteCollectionsModalProps) {
  const { space, byteCollections, onClose } = props;

  const [collections, setCollections] = useState<ByteCollectionSummary[]>(byteCollections.filter((byteCollection) => !byteCollection.archive));
  const [error, setError] = useState<string | null>(null);
  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';

  const { loading, postData } = usePostData(
    {
      successMessage: 'Byte Collections sorted successfully',
      errorMessage: 'Failed to sort byte Collections',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    {}
  );

  function handleOrderChange(index: number, order: number) {
    const newCollections = [...collections];
    newCollections[index].order = order;
    setCollections(newCollections);
  }

  async function handleSave() {
    setError(null);
    const orderNumbers = new Set<number>();
    for (const collection of collections) {
      if (orderNumbers.has(collection.order)) {
        setError('Order numbers must be unique');
      }
      orderNumbers.add(collection.order);
    }

    if (error) {
      return;
    }

    const request: SortByteCollectionsRequest = collections.map((collection) => {
      return {
        byteCollectionId: collection.id,
        order: collection.order,
      };
    });

    await postData(`${getBaseUrl()}/api/${space.id}/actions/byte-collections/sort-collections`, request);
    onClose();
  }

  return (
    <FullScreenModal open={true} onClose={props.onClose} title={`Sort Byte Collections`}>
      <PageWrapper>
        <div className="flex justify-center align-center">
          <div className="max-w-4xl">
            <div className="px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold">Sort Byte Collections</h1>
                  <p className="mt-2 text-sm">
                    Specify the Order for displaying byte collections. Collections with a lower order number appear first in the list.
                  </p>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-3">
                            Byte Collection Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
                            Archived
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold ">
                            Order
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-left">
                        {byteCollections.map((byteCollection: ByteCollectionSummary, index) => {
                          return (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-2 pl-2 pr-3 text-sm font-medium sm:pl-2">{byteCollection.name}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm">{byteCollection.archive === true ? 'Yes' : 'No'}</td>

                              <td className="whitespace-nowrap px-3 py-2 text-sm">
                                <Input
                                  number={true}
                                  modelValue={byteCollection.order?.toString() || '0'}
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
