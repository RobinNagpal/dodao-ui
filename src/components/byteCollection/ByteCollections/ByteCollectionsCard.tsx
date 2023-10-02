import Card from '@/components/core/card/Card';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionFragment } from '@/graphql/generated/generated-types';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ByteCollectionCardProps {
  byteCollection: ByteCollectionFragment;
}

export default function ByteCollectionsCard({ byteCollection }: ByteCollectionCardProps) {
  const router = useRouter();
  return (
    <Card className="p-4">
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
              router.push(`/tidbit-collections/edit/${byteCollection.id}`);
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
          {byteCollection.bytes.map((byte, eventIdx) => (
            <li key={byte.byteId}>
              <div className="relative pb-8">
                {eventIdx !== byteCollection.bytes.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div className="flex cursor-pointer">
                    <div>
                      <span className={'bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
                        <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-2 pt-1.5">
                      <div>
                        <p className="ml-2 text-sm">
                          <div className="flex">
                            <div>
                              <span className={'font-bold'}>{byte.name}</span> - <span>{byte.content}</span>
                            </div>
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
