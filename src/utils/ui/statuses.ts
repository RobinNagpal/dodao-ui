import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { PublishStatus } from '@/types/deprecated/models/enums';

export const statuses: EllipsisDropdownItem[] = [
  {
    label: 'Live',
    key: PublishStatus.Live,
  },
  {
    label: 'Draft',
    key: PublishStatus.Draft,
  },
];
