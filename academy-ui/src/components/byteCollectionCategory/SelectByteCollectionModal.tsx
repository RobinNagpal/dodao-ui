import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ByteCollectionFragment, Space } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import React, { useEffect, useState } from 'react';
import styles from './SelectByteCollectionModal.module.scss';
import axios from 'axios';

interface SelectByteCollectionModalProps {
  byteCollection?: ByteCollectionFragment;
  showSelectBytesModal: boolean;
  byteCollectionSummaries: ByteCollectionFragment[];
  onClose: () => void;
  addByteCollection: (byteCollections: ByteCollectionFragment[]) => void;
  space: Space;
}

export default function SelectByteCollectionModal(props: SelectByteCollectionModalProps) {
  const { addByteCollection, space, byteCollectionSummaries, showSelectBytesModal, onClose } = props;
  const [byteCollectionsResponse, setByteCollectionsResponse] = useState<{ byteCollections?: ByteCollectionFragment[] }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [tempSelectedByteIds, setTempSelectedByteIds] = useState<string[]>([]);
  const [tempSelectedByteCollections, setTempSelectedByteCollections] = useState<ByteCollectionFragment[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/byte-collection/byte-collections`, {
        params: {
          spaceId: props.space.id,
        },
      });
      setByteCollectionsResponse(response.data);
      setLoading(false);
    }
    fetchData();
  }, [props.space.id]);

  const availableByteCollections =
    byteCollectionsResponse?.byteCollections?.filter((byteCollection) => !byteCollectionSummaries.some((summary) => summary.id === byteCollection.id)) || [];

  const handleCardClick = (byteCollection: ByteCollectionFragment) => {
    if (tempSelectedByteIds.includes(byteCollection.id)) {
      setTempSelectedByteIds(tempSelectedByteIds.filter((id) => id !== byteCollection.id));
      setTempSelectedByteCollections(tempSelectedByteCollections.filter((collection) => collection.id !== byteCollection.id));
    } else {
      setTempSelectedByteIds([...tempSelectedByteIds, byteCollection.id]);
      setTempSelectedByteCollections([...tempSelectedByteCollections, byteCollection]);
    }
  };

  return (
    <FullPageModal open={showSelectBytesModal} onClose={onClose} title={'Select Byte Collections'}>
      {loading ? (
        <FullPageLoader />
      ) : (
        <>
          <Grid4Cols className="p-16">
            {availableByteCollections.map((byteCollection) => (
              <Card key={byteCollection.id} onClick={() => handleCardClick(byteCollection)}>
                <div className="cursor-pointer">
                  <div className="p-2 text-center">
                    <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(byteCollection.name, 32)}</h2>
                    <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(byteCollection.description, 300)}</p>
                  </div>
                </div>
                {tempSelectedByteIds.includes(byteCollection.id) && (
                  <div className="flex flex-wrap absolute justify-end top-1 right-1">
                    <div
                      className={`m-auto rounded-full text-2xl bg-primary w-6 h-6 text-white flex items-center font-bold justify-center ${styles.selectedIcon}`}
                    >
                      <CheckCircleIcon height={30} width={30} />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </Grid4Cols>

          <Button
            variant="contained"
            primary
            onClick={() => {
              addByteCollection(tempSelectedByteCollections);
              onClose();
            }}
          >
            Select Byte Collections
          </Button>
        </>
      )}
    </FullPageModal>
  );
}
