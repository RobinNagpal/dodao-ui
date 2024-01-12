import ByteCardAdminDropdown from '@/components/bytes/List/ByteCardAdminDropdown';
import Card from '@/components/core/card/Card';
import { ProjectByteFragment, ProjectFragment, QueryBytesQuery } from '@/graphql/generated/generated-types';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';

export type ByteSummaryType = QueryBytesQuery['bytes'][0];

interface ByteSummaryCardProps {
  byte: ByteSummaryType | ProjectByteFragment;
  byteType: 'byte' | 'projectByte';
  baseByteViewUrl: string;
  project?: ProjectFragment;
}

export default function ByteSummaryCard({ byte, byteType, baseByteViewUrl, project }: ByteSummaryCardProps) {
  return (
    <Card>
      <Link href={`${baseByteViewUrl}/${byte.id}/0`} className="card blog-card w-inline-block h-full w-full relative">
        <div className="absolute top-0 right-0 m-2">
          <ByteCardAdminDropdown byte={byte} byteType={byteType} project={project} />
        </div>
        <div>
          <div className="p-4 text-center w-full">
            <div className="w-full flex justify-between">
              <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full">{shorten(byte.name, 32)}</h2>
            </div>
            <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(byte.content, 300)}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
