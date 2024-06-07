import Button from '@dodao/web-core/components/core/buttons/Button';
import Card from '@dodao/web-core/components/core/card/Card';
import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ByteCollectionFragment, ByteSummaryFragment, ProjectByteFragment } from '@/graphql/generated/generated-types';
import { shorten } from '@dodao/web-core/utils/utils';
import CheckCircleIcon from '@heroicons/react/20/solid/CheckCircleIcon';
import React from 'react';
import styled from 'styled-components';

interface SelectBytesModalProps {
  byteCollection?: ByteCollectionFragment;
  showSelectBytesModal: boolean;
  onClose: () => void;
  byteSummaries: (ByteSummaryFragment | ProjectByteFragment)[];
  addBytes: (byteIds: string[]) => void;
}

const SelectedIcon = styled.button`
  color: var(--primary-color);
  background-color: white;
`;

export default function SelectBytesModal(props: SelectBytesModalProps) {
  const { byteSummaries, addBytes } = props;
  const [selectedByteIds, setSelectedByteIds] = React.useState<string[]>([]);
  return (
    <FullPageModal open={props.showSelectBytesModal} onClose={props.onClose} title={'Select Bytes'}>
      <Grid4Cols className="p-16">
        {byteSummaries.map((byte) => {
          return (
            <Card
              key={byte.id}
              onClick={() => {
                if (selectedByteIds.includes(byte.id)) {
                  setSelectedByteIds(selectedByteIds.filter((id) => id !== byte.id));
                } else {
                  setSelectedByteIds([...selectedByteIds, byte.id]);
                }
              }}
            >
              <div className="cursor-pointer">
                <div className="p-2 text-center">
                  <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(byte.name, 32)}</h2>
                  <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(byte.content, 300)}</p>
                </div>
              </div>
              {selectedByteIds.includes(byte.id) && (
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
      <Button variant="contained" primary onClick={() => addBytes(selectedByteIds)}>
        Select Bytes
      </Button>
    </FullPageModal>
  );
}
