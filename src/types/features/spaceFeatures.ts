export enum FeatureName {
  Courses = 'Courses',
  Simulations = 'Simulations',
  Timelines = 'Timelines',
  Bytes = 'Bytes',
  Guides = 'Guides',
}

export interface FeatureItem {
  featureName: FeatureName;
  enabled: boolean;
  details: {
    priority: number;
  };
}
