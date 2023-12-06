import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { StyledSelectItem } from '@/components/core/select/StyledSelect';
import { ProjectTypes, PublishStatus, Themes, VisibilityEnum } from '@/types/deprecated/models/enums';

export const publishStatusesEllipsisDropdown: EllipsisDropdownItem[] = [
  {
    label: 'Live',
    key: PublishStatus.Live,
  },
  {
    label: 'Draft',
    key: PublishStatus.Draft,
  },
];

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

export const themeSelect: StyledSelectItem[] = Object.keys(Themes).map((t) => ({
  label: t,
  id: t,
}));

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

export const projectTypeSelect: StyledSelectItem[] = Object.keys(ProjectTypes).map((t) => ({
  label: t,
  id: t,
}));
