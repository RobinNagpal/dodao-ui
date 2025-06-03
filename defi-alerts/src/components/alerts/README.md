# Position Editing Components

This directory contains reusable components for editing position conditions in the DeFi Alerts application.

## New Components

### PositionConditionEditor

A reusable component for editing position conditions. It supports both market conditions and comparison conditions.

#### Features

- Supports market conditions (`APR_RISE_ABOVE`, `APR_FALLS_BELOW`, `APR_OUTSIDE_RANGE`)
- Supports comparison conditions (`RATE_DIFF_ABOVE`, `RATE_DIFF_BELOW`)
- Provides contextual messages based on the condition type
- Handles validation errors
- Has strict typing with TypeScript interfaces

#### Usage

```tsx
import { PositionConditionEditor } from '@/components/alerts';
import { type PositionCondition } from '@/components/alerts/PositionConditionEditor';

// For market conditions
<PositionConditionEditor
  editorType="market"
  conditions={conditions}
  addCondition={addCondition}
  updateCondition={updateCondition}
  removeCondition={removeCondition}
  errors={errors}
/>

// For comparison conditions
<PositionConditionEditor
  editorType="comparison"
  actionType="SUPPLY" // or "BORROW"
  platformName="Aave" // Optional
  currentRate="4.5%" // Optional
  conditions={conditions}
  addCondition={addCondition}
  updateCondition={updateCondition}
  removeCondition={removeCondition}
  errors={errors}
/>
```

## Integration

These components can be used to replace the existing condition editing code in the various forms. For example:

1. In `PersonalizedMarketEditForm.tsx`, replace the condition editing code with `<PositionConditionEditor editorType="market" ... />`
2. In `CompoundComparisonEditForm.tsx`, replace the threshold editing code with `<PositionConditionEditor editorType="comparison" ... />`
3. In `ConfigurePositionModal.tsx`, replace the condition editing code with `<PositionConditionEditor editorType="market" ... />` or `<PositionConditionEditor editorType="comparison" ... />` depending on the modal type


## Type Definitions

The components use the following type definitions:

```typescript
// Base condition interface
export interface BaseCondition {
  id: string;
  severity: SeverityLevel;
}

// Market condition interface
export interface MarketCondition extends BaseCondition {
  conditionType: 'APR_RISE_ABOVE' | 'APR_FALLS_BELOW' | 'APR_OUTSIDE_RANGE';
  thresholdValue?: string;
  thresholdLow?: string;
  thresholdHigh?: string;
}

// Comparison condition interface
export interface ComparisonCondition extends BaseCondition {
  conditionType: 'RATE_DIFF_ABOVE' | 'RATE_DIFF_BELOW';
  thresholdValue: string;
}

// Union type for all condition types
export type PositionCondition = MarketCondition | ComparisonCondition;

// Base position interface
export interface BasePosition {
  id: string;
  actionType: 'SUPPLY' | 'BORROW';
  notificationFrequency: NotificationFrequency;
  conditions: PositionCondition[];
}

// Market position interface
export interface MarketPosition extends BasePosition {
  chain: string;
  assetSymbol: string;
  assetAddress: string;
  rate: string;
  walletAddress?: string;
}

// Comparison position interface
export interface ComparisonPosition extends BasePosition {
  chain: string;
  market: string;
  platform: string;
  rate: string;
}

// Union type for all position types
export type Position = MarketPosition | ComparisonPosition;
```
