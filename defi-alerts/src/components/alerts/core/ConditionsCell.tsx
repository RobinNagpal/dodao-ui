import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PrismaCondition, severityOptions } from '@/types/alerts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

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
  const getConditionMessage = (condition: PrismaCondition) => {
    switch (condition.conditionType) {
      case 'APR_RISE_ABOVE':
        return `Alert when APR exceeds ${formatThresholdValue(condition)}`;
      case 'APR_FALLS_BELOW':
        return `Alert when APR drops under ${formatThresholdValue(condition)}`;
      case 'APR_OUTSIDE_RANGE':
        return `Alert when APR moves outside ${formatThresholdValue(condition)}`;
      case 'RATE_DIFF_ABOVE':
        return `Alert when Rate Difference is above ${formatThresholdValue(condition)}`;
      case 'RATE_DIFF_BELOW':
        return `Alert when Rate Difference is below ${formatThresholdValue(condition)}`;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-theme-muted">{formatThresholdValue(condition)}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="h-5 w-5 p-0 hover-text-primary">
                  <Info size={14} />
                  <span className="sr-only">View all channels</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                <div className="space-y-2">
                  <p>{getConditionMessage(condition)}</p>
                  <div>
                    Severity Level:&nbsp;
                    {condition.severity === 'NONE' ? (
                      <Badge className={`${getSeverityColor(condition.severity)}`}>None</Badge>
                    ) : (
                      <Badge className={`${getSeverityColor(condition.severity)}`}>{severityLabel(condition)}</Badge>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};

export default ConditionsCell;
