interface ClickableDemoStep {
  id: string;
  url: string;
  selector: string;
  tooltipInfo: string;
  placement: string;
  order: number;
}

export interface ClickableDemoDto {
  id: string;
  title: string;
  excerpt: string;
  archive: boolean|null;
  steps: Array<ClickableDemoStep>;
}

export interface ClickableDemoSummary {
  demoId: string;
  title: string;
  excerpt: string;
  archive: boolean;
}
