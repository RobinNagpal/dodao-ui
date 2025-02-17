import ByteCardAdminDropdown from '@/components/bytes/List/ByteCardAdminDropdown';
import { QueryBytesQuery } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Card from '@dodao/web-core/components/core/card/Card';
import { shorten } from '@dodao/web-core/utils/utils';
import Link from 'next/link';
import React from 'react';

export type ByteSummaryType = QueryBytesQuery['bytes'][0];

interface ByteSummaryCardProps {
  space: SpaceWithIntegrationsDto;
  byte: ByteSummaryType;
  baseByteViewUrl: string;
}

export default function ByteSummaryCard({ byte, baseByteViewUrl, space }: ByteSummaryCardProps) {
  return (
    <Card>
      <Link href={`${baseByteViewUrl}/${byte.id}`} className="card blog-card w-inline-block h-full w-full relative">
        <div className="absolute top-0 right-0 m-2">
          <ByteCardAdminDropdown byte={byte} space={space} />
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
