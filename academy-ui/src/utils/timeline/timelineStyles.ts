import { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';

export enum TimelineStyles {
  V1_Default = 'V1_Default',
  V2_OneSide = 'V2_OneSide',
  V2_SideBySide = 'V2_SideBySide',
}

export const timelineStyleSelect: StyledSelectItem[] = [
  {
    label: 'V1 Default',
    id: TimelineStyles.V1_Default,
  },
  {
    label: 'V2 One Side',
    id: TimelineStyles.V2_OneSide,
  },
  {
    label: 'V2 Side By Side',
    id: TimelineStyles.V2_SideBySide,
  },
];
