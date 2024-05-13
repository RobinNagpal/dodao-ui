export interface ClickableDemoStepError {
  url?: boolean;
  selector?: boolean;
  tooltipInfo?: boolean;
}

export interface ClickableDemoErrors {
  title?: boolean;
  excerpt?: boolean;
  steps?: Record<string, ClickableDemoStepError>;
}
