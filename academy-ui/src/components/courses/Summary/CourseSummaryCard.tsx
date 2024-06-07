import Thumbnail from '@dodao/web-core/components/app/Thumbnail';
import Card from '@dodao/web-core/components/core/card/Card';
import { CourseFragment } from '@/graphql/generated/generated-types';
import { shorten } from '@dodao/web-core/utils/utils';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

interface GuideSummaryCardProps {
  course: CourseFragment;
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

const CourseSummaryCard: React.FC<GuideSummaryCardProps> = ({ course, inProgress }) => {
  return (
    <Card>
      <Link href={`/courses/view/${course.key}`} className="card blog-card w-inline-block h-full w-full">
        {inProgress && <Ribbon className="ribbon progress-label">In progress</Ribbon>}
        <div className="image-wrapper blog-card-thumbnail w-full">
          <Thumbnail src={course.thumbnail!} entityId={course.key} title={course.title} size="350" className="mb-1 w-full" big_tile imageClass="w-full" />
        </div>
        <div className="p-4 text-center">
          <h2 className="text-base font-bold whitespace-nowrap overflow-hidden overflow-ellipsis">{shorten(course.title, 32)}</h2>
          <p className="break-words mb-2 h-65px overflow-ellipsis overflow-hidden text-sm">{shorten(course.summary, 300)}</p>
        </div>
        {course.publishStatus === 'Draft' && (
          <div className="flex flex-wrap justify-end absolute top-2 left-2">
            <div className="badge post-category mb-1">{course.publishStatus}</div>
          </div>
        )}
      </Link>
    </Card>
  );
};

export default CourseSummaryCard;
