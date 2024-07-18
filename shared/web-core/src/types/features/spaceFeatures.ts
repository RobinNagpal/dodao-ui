export enum FeatureName {
  Courses = 'Courses',
  Chatbot = 'Chatbot',
  Bytes = 'Bytes',
  ByteCollections = 'ByteCollections',
  ByteCollectionCategories = 'ByteCollectionCategories',
  Guides = 'Guides',
  Shorts = 'Shorts',
  Simulations = 'Simulations',
  Timelines = 'Timelines',
  ClickableDemos = 'ClickableDemos',
}

export interface FeatureItem {
  featureName: FeatureName;
  enabled: boolean;
  details: {
    priority: number;
  };
}
