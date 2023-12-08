import V1DefaultTimelineView from '@/components/timelines/View/V1Default/V1DefaultTimelineView';
import V2OneSideTimelineView from '@/components/timelines/View/V2OneSide/V2OneSideTimelineView';
import { Space, TimelineDetailsFragment } from '@/graphql/generated/generated-types';
import { TimelineStyles } from '@/utils/timeline/timelineStyles';

export interface TimelineDetailsProps {
  space: Space;
  timeline: TimelineDetailsFragment;
}

export default function TimelineDetailView(props: TimelineDetailsProps) {
  if (props.timeline.timelineStyle === TimelineStyles.V2_OneSide) {
    return <V2OneSideTimelineView space={props.space} timeline={props.timeline} />;
  }

  return <V1DefaultTimelineView space={props.space} timeline={props.timeline} />;
}
