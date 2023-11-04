import DiscourseIndexRuns from '@/components/spaces/Loaders/Discourse/DiscourseIndexRuns';
import SpaceLoadersInformation from '@/components/spaces/View/SpaceLoadersInformation';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export interface DiscourseInfoProps {
  space: SpaceWithIntegrationsFragment;
}

export default function DiscourseInfo(props: DiscourseInfoProps) {
  return (
    <div className="divide-y divide-slate-400  divide-dashed">
      <div className="mb-32">
        <SpaceLoadersInformation space={props.space} />
      </div>
      <div>{props.space.spaceIntegrations?.loadersInfo?.discourseUrl ? <DiscourseIndexRuns space={props.space} /> : <div>No Discourse URL Set</div>}</div>
    </div>
  );
}
