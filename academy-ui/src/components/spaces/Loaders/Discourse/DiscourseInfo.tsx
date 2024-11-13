import DiscourseIndexRuns from '@/components/spaces/Loaders/Discourse/DiscourseIndexRuns';
import SpaceLoadersInformation from '@/components/spaces/View/SpaceLoadersInformation';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import React from 'react';

export interface DiscourseInfoProps {
  space: SpaceWithIntegrationsDto;
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
