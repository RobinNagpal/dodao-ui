export enum FeatureName {
  Courses = 'Courses',
  Chatbot = 'Chatbot',
  Bytes = 'Bytes',
  ByteCollections = 'ByteCollections',
  Guides = 'Guides',
  Shorts = 'Shorts',
  Simulations = 'Simulations',
  Timelines = 'Timelines',
}

export interface FeatureItem {
  featureName: FeatureName;
  enabled: boolean;
  details: {
    priority: number;
  };
}
