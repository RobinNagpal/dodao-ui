export interface SimulationStepError {
  name?: boolean;
  content?: boolean;
  iframeUrl?: string;
}

export interface SimulationErrors {
  name?: boolean;
  excerpt?: boolean;
  content?: boolean;
  steps?: Record<string, SimulationStepError>;
}
