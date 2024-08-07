import Thumbnail from '@dodao/web-core/components/app/Thumbnail';
import Card from '@dodao/web-core/components/core/card/Card';
import GuideInProgressIndicator from '@/components/guides/Summary/GuideInProgressIndicator';
import { GuideSummaryFragment } from '@/graphql/generated/generated-types';
import { shorten } from '@dodao/web-core/utils/utils';
import Link from 'next/link';
import React from 'react';

interface GuideSummaryCardProps {
  guide: GuideSummaryFragment;
}

const GuideSummaryCard: React.FC<GuideSummaryCardProps> = ({ guide }) => {
  return (
    <Card>
      <Link href={`/guides/view/${guide.id}/0`} className="card blog-card w-inline-block h-full w-full">
        <GuideInProgressIndicator guide={guide} />
        <div className="w-full">
          <Thumbnail src={guide.thumbnail!} entityId={guide.uuid} title={guide.guideName} size="350" className="mb-1 w-full " big_tile imageClass="w-full" />
        </div>
        <div className="p-4 text-center">
          <h2 className="text-base font-bold whitespace-nowrap overflow-hidden overflow-ellipsis">{shorten(guide.guideName, 32)}</h2>
          <p className="break-words mb-2 h-65px overflow-ellipsis overflow-hidden text-sm">{shorten(guide.content, 300)}</p>
        </div>
        {guide.publishStatus === 'Draft' && (
          <div className="flex flex-wrap justify-end absolute top-2 left-2">
            <div className="badge post-category mb-1">{guide.publishStatus}</div>
          </div>
        )}
      </Link>
    </Card>
  );
};

export default GuideSummaryCard;
