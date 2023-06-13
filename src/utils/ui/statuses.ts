import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { PublishStatus, VisibilityEnum } from '@/types/deprecated/models/enums';

export const publishStatuses: EllipsisDropdownItem[] = [
  {
    label: 'Live',
    key: PublishStatus.Live,
  },
  {
    label: 'Draft',
    key: PublishStatus.Draft,
  },
];

export const visibilityOptions: EllipsisDropdownItem[] = [
  {
    label: 'Public',
    key: VisibilityEnum.Public,
  },
  {
    label: 'Hidden',
    key: VisibilityEnum.Hidden,
  },
];
