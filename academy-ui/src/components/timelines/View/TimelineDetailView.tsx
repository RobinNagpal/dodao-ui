import V1DefaultTimelineView from '@/components/timelines/View/V1Default/V1DefaultTimelineView';
import V2OneSideTimelineView from '@/components/timelines/View/V2OneSide/V2OneSideTimelineView';
import V2SideBySideTimelineView from '@/components/timelines/View/V2SideBySide/V2SideBySideTimelineView';
import { TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { TimelineStyles } from '@/utils/timeline/timelineStyles';

export interface TimelineDetailsProps {
  space: SpaceWithIntegrationsDto;
  timeline: TimelineDetailsFragment;
}

export default function TimelineDetailView(props: TimelineDetailsProps) {
  if (props.timeline.timelineStyle === TimelineStyles.V2_OneSide) {
    return <V2OneSideTimelineView space={props.space} timeline={props.timeline} />;
  }

  if (props.timeline.timelineStyle === TimelineStyles.V2_SideBySide) {
    return <V2SideBySideTimelineView space={props.space} timeline={props.timeline} />;
  }

  return <V1DefaultTimelineView space={props.space} timeline={props.timeline} />;
}
