export interface SimulationStepError {
  name?: boolean;
  content?: boolean;
  iframeUrl?: string;
}

export interface SimulationErrors {
  name?: boolean;
  content?: boolean;
  steps?: Record<string, SimulationStepError>;
}
