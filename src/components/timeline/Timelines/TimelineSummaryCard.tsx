import Card from '@/components/core/card/Card';
import { TimelinesQuery } from '@/graphql/generated/generated-types';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';

interface TimelineSummaryCardProps {
  timeline: TimelinesQuery['timelines'][0];
}

export default function TimelineSummaryCard({ timeline }: TimelineSummaryCardProps) {
  return (
    <Card>
      <Link href={`/timelines/view/${timeline.id}`} className="card blog-card w-inline-block h-full w-full">
        <div>
          <div className="p-4 text-center">
            <h2 className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{shorten(timeline.name, 32)}</h2>
            <p className="break-words mb-2 text-sm h-65px text-ellipsis overflow-hidden">{shorten(timeline.content, 300)}</p>
          </div>

          {timeline.publishStatus === 'Draft' && (
            <div className="flex flex-wrap justify-end absolute top-2 left-2">
              <div className="badge post-category mb-1">{timeline.publishStatus}</div>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
