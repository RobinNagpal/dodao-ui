export enum FeatureName {
  Courses = 'Courses',
  Simulations = 'Simulations',
  Timelines = 'Timelines',
  Bytes = 'Bytes',
  ByteCollections = 'ByteCollections',
  Guides = 'Guides',
}

export interface FeatureItem {
  featureName: FeatureName;
  enabled: boolean;
  details: {
    priority: number;
  };
}
