import Card from '@/components/core/card/Card';
import { ProjectByteFragment, QueryBytesQuery } from '@/graphql/generated/generated-types';
import { VisibilityEnum } from '@/types/deprecated/models/enums';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';

export type ByteSummaryType = QueryBytesQuery['bytes'][0];

interface ByteSummaryCardProps {
  byte: ByteSummaryType | ProjectByteFragment;
  baseByteViewUrl: string;
}

export default function ByteSummaryCard({ byte, baseByteViewUrl }: ByteSummaryCardProps) {
  return (
    <Card>
      <Link href={`${baseByteViewUrl}/${byte.id}/0`} className="card blog-card w-inline-block h-full w-full">
        <div>
          <div className="p-4 text-center">
            <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(byte.name, 32)}</h2>
            <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(byte.content, 300)}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
