import DiscourseIndexRuns from '@/components/spaces/Loaders/Discourse/DiscourseIndexRuns';
import SpaceLoadersInformation from '@/components/spaces/View/SpaceLoadersInformation';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface DiscourseInfoProps {
  space: SpaceWithIntegrationsFragment;
}

export default function DiscourseInfo(props: DiscourseInfoProps) {
  return (
    <div>
      <SpaceLoadersInformation space={props.space} />
      {props.space.spaceIntegrations?.loadersInfo?.discourseUrl ? <DiscourseIndexRuns space={props.space} /> : <div>No Discourse URL Set</div>}
    </div>
  );
}
