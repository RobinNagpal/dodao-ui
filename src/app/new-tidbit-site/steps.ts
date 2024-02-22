export type StepId = 'user-details' | 'tidbit-site-details' | 'site-configuration';

export type StepStatus = 'complete' | 'current' | 'upcoming';

export interface Step {
  id: StepId;
  name: string;
  status: StepStatus;
}

export const initialSteps: Step[] = [
  { id: 'user-details', name: 'User Details', status: 'current' },
  { id: 'tidbit-site-details', name: 'Tidbit Site Details', status: 'upcoming' },
  { id: 'site-configuration', name: 'Site Configuration', status: 'upcoming' },
];
