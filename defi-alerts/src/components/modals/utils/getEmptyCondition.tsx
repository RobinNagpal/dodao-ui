import { ComparisonCondition, MarketCondition } from '@/components/alerts/PositionConditionEditor';

export function getEmptyCondition(
  modalType: 'MARKET' | 'COMPARISON',
  conditions: (MarketCondition | ComparisonCondition)[],
  alertType: 'supply' | 'borrow'
): MarketCondition | ComparisonCondition {
  const id = conditions.length + '-condition';
  if (modalType === 'MARKET') {
    return {
      id: id,
      conditionType: 'APR_OUTSIDE_RANGE',
      thresholdLow: '',
      thresholdHigh: '',
      severity: 'NONE',
    } as MarketCondition;
  } else {
    if (alertType === 'borrow') {
      return { id: id, conditionType: 'RATE_DIFF_BELOW', thresholdValue: '', severity: 'NONE' } as ComparisonCondition;
    } else {
      return { id: id, conditionType: 'RATE_DIFF_ABOVE', thresholdValue: '', severity: 'NONE' } as ComparisonCondition;
    }
  }
}
