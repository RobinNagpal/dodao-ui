import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@dodao/web-core/components/core/grids/Grid4Cols';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ByteCollectionFragment, Space, useByteCollectionsQuery } from '@/graphql/generated/generated-types';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import React from 'react';
import styles from './SelectByteCollectionModal.module.scss';

interface SelectByteCollectionModalProps {
  byteCollection?: ByteCollectionFragment;
  showSelectBytesModal: boolean;
  onClose: () => void;
  addByteCollection: (byteCollections: ByteCollectionFragment[]) => void;
  space: Space;
}

export default function SelectByteCollectionModal(props: SelectByteCollectionModalProps) {
  const { addByteCollection, space } = props;

  const { data: byteCollectionsResponse, loading } = useByteCollectionsQuery({
    variables: {
      spaceId: space.id,
    },
  });
  const [selectedByteIds, setSelectedByteIds] = React.useState<string[]>([]);
  const [selectedByteCollection, setSelectedByteCollection] = React.useState<ByteCollectionFragment[]>([]);
  return (
    <FullPageModal open={props.showSelectBytesModal} onClose={props.onClose} title={'Select Byte Collections'}>
      {loading ? (
        <FullPageLoader />
      ) : (
        <>
          <Grid4Cols className="p-16">
            {(byteCollectionsResponse?.byteCollections || []).map((byteCollection) => {
              return (
                <Card
                  key={byteCollection.id}
                  onClick={() => {
                    if (selectedByteIds.includes(byteCollection.id)) {
                      setSelectedByteIds(selectedByteIds.filter((id) => id !== byteCollection.id));
                      setSelectedByteCollection(selectedByteCollection.filter((byteCollection) => byteCollection.id !== byteCollection.id));
                    } else {
                      setSelectedByteIds([...selectedByteIds, byteCollection.id]);
                      setSelectedByteCollection([...selectedByteCollection, byteCollection]);
                    }
                  }}
                >
                  <div className="cursor-pointer">
                    <div className="p-2 text-center">
                      <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(byteCollection.name, 32)}</h2>
                      <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(byteCollection.description, 300)}</p>
                    </div>
                  </div>
                  {selectedByteIds.includes(byteCollection.id) && (
                    <div className="flex flex-wrap absolute justify-end top-1 right-1">
                      <div
                        className={` m-auto rounded-full text-2xl bg-primary w-6 h-6 text-white flex items-center font-bold justify-center ${styles.selectedIcon}`}
                      >
                        <CheckCircleIcon height={30} width={30} />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </Grid4Cols>

          <Button variant="contained" primary onClick={() => addByteCollection(selectedByteCollection)}>
            Select Byte Collections
          </Button>
        </>
      )}
    </FullPageModal>
  );
}
