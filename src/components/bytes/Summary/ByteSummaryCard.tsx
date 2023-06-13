import Card from '@/components/core/card/Card';
import { QueryBytesQuery } from '@/graphql/generated/generated-types';
import { VisibilityEnum } from '@/types/deprecated/models/enums';
import { publishStatuses } from '@/utils/ui/statuses';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';

interface ByteSummaryCardProps {
  byte: QueryBytesQuery['bytes'][0];
}

export default function ByteSummaryCard({ byte }: ByteSummaryCardProps) {
  return (
    <Card>
      <Link href={`/tidbits/view/${byte.id}/0`} className="card blog-card w-inline-block h-full w-full">
        <div>
          <div className="p-4 text-center">
            <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(byte.name, 32)}</h2>
            <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(byte.content, 300)}</p>
          </div>

          {byte.visibility === VisibilityEnum.Hidden && (
            <div className="flex flex-wrap justify-end absolute top-2 left-2">
              <div className="badge post-category mb-1">{VisibilityEnum.Hidden}</div>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
