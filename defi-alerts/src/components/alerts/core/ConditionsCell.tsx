import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PrismaCondition, severityOptions } from '@/types/alerts';

interface ConditionsCellProps {
  conditions: PrismaCondition[];
}

/**
 * Component for displaying alert conditions in a table cell
 */
const ConditionsCell: React.FC<ConditionsCellProps> = ({ conditions }) => {
  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-theme-bg-muted text-theme-muted border-theme-border-primary';
    }
  };

  // Format condition threshold values based on condition type
  const formatThresholdValue = (condition: PrismaCondition) => {
    if (condition.conditionType === 'APR_OUTSIDE_RANGE') {
      return condition.thresholdValueLow && condition.thresholdValueHigh ? `${condition.thresholdValueLow}–${condition.thresholdValueHigh}%` : '-';
    } else {
      return condition.thresholdValue ? `${condition.thresholdValue}%` : '-';
    }
  };

  // Get severity label
  const severityLabel = (condition: PrismaCondition) => severityOptions.find((o) => o.value === condition.severity)?.label || '-';

  return (
    <div className="flex flex-col gap-2">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          {condition.severity !== 'NONE' && <Badge className={`${getSeverityColor(condition.severity)}`}>{severityLabel(condition)}</Badge>}
          <span className="text-xs text-theme-muted">{formatThresholdValue(condition)}</span>
        </div>
      ))}
    </div>
  );
};

export default ConditionsCell;
