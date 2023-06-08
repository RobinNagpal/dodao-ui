'use client';

import withSpace from '@/app/withSpace';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

const CourseView = ({ params, space }: { params: { courseInfo: string[] }; space: SpaceWithIntegrationsFragment }) => {
  return <span>CourseView</span>;
};

export default withSpace(CourseView);
