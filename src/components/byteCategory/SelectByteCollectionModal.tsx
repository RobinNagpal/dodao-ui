import Button from '@/components/core/buttons/Button';
import Card from '@/components/core/card/Card';
import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
import FullPageModal from '@/components/core/modals/FullPageModal';
import { ByteCollectionFragment, Space } from '@/graphql/generated/generated-types';
import getApiResponse from '@/utils/api/getApiResponse';
import { shorten } from '@/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import React, { useEffect } from 'react';
import styled from 'styled-components';

interface SelectByteCollectionModalProps {
  byteCollection?: ByteCollectionFragment;
  showSelectBytesModal: boolean;
  onClose: () => void;
  addByteCollection: (byteCollections: ByteCollectionFragment[]) => void;
  space: Space;
}

const SelectedIcon = styled.button`
  color: var(--primary-color);
  background-color: white;
`;

export default function SelectByteCollectionModal(props: SelectByteCollectionModalProps) {
  const { addByteCollection, space } = props;
  const [byteCollectionSummaries, setByteCollectionSummaries] = React.useState<ByteCollectionFragment[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const byteCollections = await getApiResponse<ByteCollectionFragment[]>(space, 'byte-collections');
      setByteCollectionSummaries(byteCollections);
    };

    fetchData();
  }, []);
  const [selectedByteIds, setSelectedByteIds] = React.useState<string[]>([]);
  const [selectedByteCollection, setSelectedByteCollection] = React.useState<ByteCollectionFragment[]>([]);
  return (
    <FullPageModal open={props.showSelectBytesModal} onClose={props.onClose} title={'Select Bytes'}>
      <Grid4Cols className="p-16">
        {byteCollectionSummaries.map((byteCollection) => {
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
                  <SelectedIcon className="m-auto rounded-full text-2xl bg-primary w-6 h-6 text-white flex items-center font-bold justify-center ">
                    <CheckCircleIcon height={30} width={30} />
                  </SelectedIcon>
                </div>
              )}
            </Card>
          );
        })}
      </Grid4Cols>
      <Button variant="contained" primary onClick={() => addByteCollection(selectedByteCollection)}>
        Select Byte Collections
      </Button>
    </FullPageModal>
  );
}
