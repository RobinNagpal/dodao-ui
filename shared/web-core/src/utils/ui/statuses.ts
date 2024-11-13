import { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';

export const publishStatusesSelect: StyledSelectItem[] = [
  {
    label: 'Live',
    id: PublishStatus.Live,
  },
  {
    label: 'Draft',
    id: PublishStatus.Draft,
  },
];
