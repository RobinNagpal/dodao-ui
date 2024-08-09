interface ClickableDemoStep {
  id: string;
  url: string;
  selector: string;
  tooltipInfo: string;
  placement: string;
  order: number;
}

export interface ClickableDemo {
  demoId: string;
  title: string;
  excerpt: string;
  archive: boolean;
  steps: Array<ClickableDemoStep>;
}

export interface ClickableDemoSummary {
  demoId: string;
  title: string;
  excerpt: string;
  archive: boolean;
}
