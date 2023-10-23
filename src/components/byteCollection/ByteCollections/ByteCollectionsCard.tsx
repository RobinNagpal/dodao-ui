import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionFragment, ProjectByteCollectionFragment } from '@/graphql/generated/generated-types';
import { LocalStorageKeys } from '@/types/deprecated/models/enums';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import { useRouter } from 'next/navigation';
import React from 'react';
import styled from 'styled-components';

interface ByteCollectionCardProps {
  byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  onSelectByte: (byteId: string) => void;
  baseByteCollectionsEditUrl: string;
}

const TidBitIconSpan = styled.span`
  background-color: var(--primary-color);
`;

const OpenInPopupIcon = styled(ArrowTopRightOnSquareIcon)`
  color: var(--primary-color);
`;

export default function ByteCollectionsCard({ byteCollection, baseByteCollectionsEditUrl, onSelectByte }: ByteCollectionCardProps) {
  const router = useRouter();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden  p-4 w-full max-w-xl">
      <div className="w-full flex justify-end">
        <PrivateEllipsisDropdown
          items={[
            {
              label: 'Edit',
              key: 'edit',
            },
          ]}
          onSelect={async (key) => {
            if (key === 'edit') {
              router.push(`${baseByteCollectionsEditUrl}/${byteCollection.id}`);
            }
          }}
        />
      </div>
      <div className="mt-3 ml-2 text-xl">
        <div>{byteCollection.name}</div>
        <div className="my-3 text-sm">{byteCollection.description}</div>
      </div>
      <div className="flow-root p-2">
        <ul role="list" className="-mb-8">
          {byteCollection.bytes.map((byte, eventIdx) => {
            const isByteCompleted = JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_TIDBITS) || '[]')?.includes(byte.byteId);
            return (
              <li key={byte.byteId}>
                <div className="relative pb-8">
                  {eventIdx !== byteCollection.bytes.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div className="flex cursor-pointer" onClick={() => onSelectByte(byte.byteId)}>
                      <div>
                        {isByteCompleted ? (
                          <div className={'bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
                            <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </div>
                        ) : (
                          <TidBitIconSpan className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
                            <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </TidBitIconSpan>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-2 transform hover:scale-95 transition duration-300 ease-in-out">
                        <div className="ml-3 text-sm">
                          <div className="font-bold flex">
                            {`${byte.name}`} <OpenInPopupIcon className="h-4 w-4 ml-2" />
                          </div>

                          <div className="flex-wrap">{byte.content}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
