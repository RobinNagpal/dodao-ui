import { CssTheme } from '@dodao/web-core/components/app/themes';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { ProjectTypes, PublishStatus, VisibilityEnum } from '@dodao/web-core/types/deprecated/models/enums';

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

export const themeSelect: StyledSelectItem[] = Object.keys(CssTheme).map((t) => ({
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
