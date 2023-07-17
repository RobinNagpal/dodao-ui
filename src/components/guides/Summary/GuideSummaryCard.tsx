import Thumbnail from '@/components/app/Thumbnail';
import Card from '@/components/core/card/Card';
import guideSubmissionCache from '@/components/guides/View/guideSubmissionCache';
import { GuideSummaryFragment } from '@/graphql/generated/generated-types';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React, { useEffect } from 'react';
import styled from 'styled-components';

interface GuideSummaryCardProps {
  guide: GuideSummaryFragment;
}

const InProgressSpan = styled.span`
  position: absolute;
  right: 10px;
  top: 10px;
  background-color: var(--primary-color);
  color: white;
`;
const GuideSummaryCard: React.FC<GuideSummaryCardProps> = ({ guide }) => {
  const [inProgress, setInProgress] = React.useState(false);

  useEffect(() => {
    const submissionsCache = guideSubmissionCache.readGuideSubmissionsCache(guide.id);
    if (submissionsCache && Object.values(submissionsCache.stepResponsesMap).some((s) => s.isCompleted)) {
      setInProgress(true);
    }
  }, []);

  return (
    <Card>
      <Link href={`/guides/view/${guide.id}/0`} className="card blog-card w-inline-block h-full w-full">
        {inProgress && (
          <InProgressSpan className="inline-flex items-center gap-x-1.5 rounded-md  px-2 py-1 text-xs font-medium text-green-700">
            <svg className="h-1.5 w-1.5 fill-white" viewBox="0 0 6 6" aria-hidden="true">
              <circle cx={3} cy={3} r={3} />
            </svg>
            In Progress
          </InProgressSpan>
        )}
        <div className="w-full">
          <Thumbnail src={guide.thumbnail!} entityId={guide.uuid} title={guide.name} size="350" className="mb-1 w-full" big_tile imageClass="w-full" />
        </div>
        <div className="p-4 text-center">
          <h2 className="text-base font-bold whitespace-nowrap overflow-hidden overflow-ellipsis">{shorten(guide.name, 32)}</h2>
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
