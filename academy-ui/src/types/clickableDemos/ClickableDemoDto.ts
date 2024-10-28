export enum TooltipPlacement {
  bottom = 'bottom',
  left = 'left',
  right = 'right',
  top = 'top',
}

export interface ClickableDemoStepDto {
  elementImgUrl?: string;
  id: string;
  order: number;
  placement: TooltipPlacement;
  screenImgUrl?: string;
  selector: string;
  tooltipInfo: string;
  url: string;
}

export interface ClickableDemoDto {
  archive?: boolean;
  createdAt: Date;
  excerpt: string;
  id: string;
  spaceId: string;
  steps: Array<ClickableDemoStepDto>;
  title: string;
  updatedAt: Date;
}

export interface ClickableDemoSummary {
  demoId: string;
  title: string;
  excerpt: string;
  archive: boolean;
}
