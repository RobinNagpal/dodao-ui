export enum FeatureName {
  Courses = 'Courses',
  Simulations = 'Simulations',
  Timelines = 'Timelines',
  Bytes = 'Bytes',
  Guides = 'Guides'
}

export interface FeatureItem {
  featureName: FeatureName;
  enabled: boolean;
  details: {
    priority: number;
  };
}

export const compoundFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90
    }
  },
  {
    featureName: FeatureName.Bytes,
    enabled: true,
    details: {
      priority: 80
    }
  },
  {
    featureName: FeatureName.Simulations,
    enabled: true,
    details: {
      priority: 70
    }
  },
  {
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 60
    }
  },
  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 50
    }
  }
];

export const uniswapFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90
    }
  },
  {
    featureName: FeatureName.Bytes,
    enabled: true,
    details: {
      priority: 80
    }
  },
  {
    featureName: FeatureName.Simulations,
    enabled: true,
    details: {
      priority: 70
    }
  },
  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 50
    }
  }
];

export const dodaoFeatures: FeatureItem[] = [
  {
    featureName: FeatureName.Guides,
    enabled: true,
    details: {
      priority: 90
    }
  },
  {
    featureName: FeatureName.Courses,
    enabled: true,
    details: {
      priority: 80
    }
  },
  {
    featureName: FeatureName.Bytes,
    enabled: true,
    details: {
      priority: 70
    }
  },
  {
    featureName: FeatureName.Timelines,
    enabled: true,
    details: {
      priority: 60
    }
  }
];
