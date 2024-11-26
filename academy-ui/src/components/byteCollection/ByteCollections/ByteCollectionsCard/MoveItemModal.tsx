import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import React, { useState } from 'react';
import LoadingIcon from '@dodao/web-core/components/core/loaders/LoadingIcon';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';

interface MoveItemModalProps {
  showSelectByteCollectionModal: boolean;
  onClose: () => void;
  selectByteCollection: (byteCollection: ByteCollectionSummary) => Promise<void>;
  byteCollectionId: string;
  spaceId: string;
}

export default function MoveItemModal(props: MoveItemModalProps) {
  const { selectByteCollection, byteCollectionId, showSelectByteCollectionModal, onClose, spaceId } = props;
  const [moving, setMoving] = useState<boolean>(false);

  const [selectedByteCollectionId, setSelectedByteCollectionId] = useState<string | null>(null);
  const { data, loading } = useFetchData<ByteCollectionSummary[]>(`${getBaseUrl()}/api/${spaceId}/byte-collections`, {}, 'Failed to fetch byte collections');

  const availableByteCollections = data?.filter((byteCollection) => byteCollection.id != byteCollectionId) || [];

  const handleCardClick = (byteCollection: ByteCollectionSummary) => {
    // When a new byteCollection is clicked, deselect the previous one
    if (selectedByteCollectionId === byteCollection.id) {
      setSelectedByteCollectionId(null);
    } else {
      setSelectedByteCollectionId(byteCollection.id);
    }
  };

  return (
    <FullPageModal open={showSelectByteCollectionModal} onClose={onClose} title={'Select ByteCollection'}>
      {loading ? (
        <div className="text-center min-h-[40vh] flex justify-center items-center">
          <LoadingIcon />
        </div>
      ) : (
        <div className="min-h-[40vh]">
          <Grid4Cols className="p-16 text-color">
            {availableByteCollections.map((byteCollection) => (
              <div
                key={byteCollection.id}
                style={{
                  border: selectedByteCollectionId === byteCollection.id ? '2px solid var(--primary-color)' : '',
                  borderRadius: '0.75rem',
                }}
              >
                <Card
                  onClick={() => handleCardClick(byteCollection)}
                  className={`common-class ${
                    selectedByteCollectionId == byteCollection.id ? 'border-none' : 'border-default'
                  } h-16 flex justify-center items-center pb-2`}
                >
                  <div className="cursor-pointer">
                    <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis mt-2">{shorten(byteCollection.name, 32)}</h2>
                  </div>
                  {selectedByteCollectionId === byteCollection.id && (
                    <div className="flex flex-wrap absolute justify-end top-1 left-1">
                      <div className={`m-auto rounded-full text-2xl bg-primary w-6 h-6 text-white flex items-center font-bold justify-center`}>
                        <CheckCircleIcon height={30} width={30} />
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </Grid4Cols>

          <Button
            variant="contained"
            primary
            onClick={async () => {
              const selectedByteCollection = availableByteCollections.find((byteCollection) => byteCollection.id === selectedByteCollectionId);
              if (selectedByteCollection) {
                setMoving(true);
                await selectByteCollection(selectedByteCollection);
                setMoving(false);
              }
              onClose();
            }}
            disabled={!selectedByteCollectionId}
            loading={moving}
          >
            Move
          </Button>
        </div>
      )}
    </FullPageModal>
  );
}
