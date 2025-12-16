export interface PromptConfig {
  key: string;
  name: string;
  requiresInput: boolean;
}

export const PROMPTS: PromptConfig[] = [
  {
    key: 'US/public-equities-v1/industry/analysis',
    name: 'Industry Analysis',
    requiresInput: true,
  },
  {
    key: 'US/public-equities-v1/industry/video/script',
    name: 'Audio Script for Industry',
    requiresInput: false,
  },
  {
    key: 'US/public-equities-v1/building-blocks/analysis/',
    name: 'Building Block Analysis',
    requiresInput: false,
  },
  {
    key: 'US/public-equities-v1/building-blocks/video/script',
    name: 'Audio Script for Building Block',
    requiresInput: false,
  },
  {
    key: 'US/public-equities-v1/industry/ui/structured-report',
    name: 'Industry UI Report',
    requiresInput: false,
  },
  {
    key: 'US/public-equities-v1/building-blocks/ui/structured-report',
    name: 'Building Block UI Report',
    requiresInput: false,
  },
];
