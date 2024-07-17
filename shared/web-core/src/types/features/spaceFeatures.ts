export enum FeatureName {
  Rubrics = 'Rubrics',
  Programs = 'Programs',
}

export interface FeatureItem {
  featureName: FeatureName;
  enabled: boolean;
  details: {
    priority: number;
  };
}
