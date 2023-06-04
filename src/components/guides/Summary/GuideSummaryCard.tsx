import Thumbnail from '@/components/app/Thumbnail';
import Card from '@/components/core/card/Card';
import { GuideSummaryFragment } from '@/graphql/generated/generated-types';
import { shorten } from '@/utils/utils';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

interface GuideSummaryCardProps {
  guide: GuideSummaryFragment;
  inProgress: boolean;
}

const Ribbon = styled.div`
  margin: 28px 18px 18px 0;
  color: white;
  padding: 16px 0;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(0%) translateY(135%) rotate(-45deg);
  transform-origin: top left;
  background-color: var(--primary-color);
  z-index: 2;
  line-height: 0;
  font-weight: 650;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    margin: 0 -1px; /* tweak */
    width: 100%;
    height: 100%;
  }

  &::before {
    right: 100%;
  }

  &::after {
    left: 100%;
  }
`;

const GuideSummaryCard: React.FC<GuideSummaryCardProps> = ({ guide, inProgress }) => {
  return (
    <Card>
      <Link href={`/guides/view/${guide.id}/0`} className="card blog-card w-inline-block h-full w-full">
        {inProgress && <Ribbon className="ribbon progress-label">In progress</Ribbon>}
        <div className="image-wrapper blog-card-thumbnail w-full">
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
