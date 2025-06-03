import { PlatformImage } from '@/components/alerts/core/PlatformImage';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type Alert, PrismaCondition, severityOptions } from '@/types/alerts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface ConditionsCellProps {
  alert: Alert;
}

/**
 * Component for displaying alert conditions in a table cell
 */
const ConditionsCell: React.FC<ConditionsCellProps> = ({ alert }) => {
  const conditions: PrismaCondition[] = alert.conditions;
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
      if (condition.thresholdValueLow && condition.thresholdValueHigh) {
        try {
          const lowValue = parseFloat(condition.thresholdValueLow);
          const highValue = parseFloat(condition.thresholdValueHigh);

          if (!isNaN(lowValue) && !isNaN(highValue)) {
            return `${lowValue.toFixed(2)}–${highValue.toFixed(2)}`;
          } else {
            return `${condition.thresholdValueLow}–${condition.thresholdValueHigh}`;
          }
        } catch (error) {
          return `${condition.thresholdValueLow}–${condition.thresholdValueHigh}`;
        }
      } else {
        return '-';
      }
    } else {
      if (condition.thresholdValue) {
        try {
          const value = parseFloat(condition.thresholdValue);

          if (!isNaN(value)) {
            return value.toFixed(2);
          } else {
            return `${condition.thresholdValue}`;
          }
        } catch (error) {
          return `${condition.thresholdValue}`;
        }
      } else {
        return '-';
      }
    }
  };

  // Get severity label
  const severityLabel = (condition: PrismaCondition) => severityOptions.find((o) => o.value === condition.severity)?.label || '-';
  const getConditionMessage = (alert: Alert, condition: PrismaCondition) => {
    if (alert.isComparison) {
      switch (condition.conditionType) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={'compound'} /> APR exceeds APR of{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              by {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={'compound'} /> APR drops below{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              APR by {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              Alert when <PlatformImage platform={'compound'} /> APR moves outside {formatThresholdValue(condition)} of{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              APR
            </span>
          );
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Alert when rate difference between <PlatformImage platform={'compound'} /> and{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              is above {formatThresholdValue(condition)}
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Alert when rate difference between <PlatformImage platform={'compound'} /> and{' '}
              {alert.compareProtocols.map((cp, index) => (
                <span key={index}>
                  <PlatformImage platform={cp} />
                  {index < alert.compareProtocols.length - 1 ? ', ' : ''}
                </span>
              ))}{' '}
              is below {formatThresholdValue(condition)}
            </span>
          );
      }
    } else {
      const platform = alert.compareProtocols && alert.compareProtocols.length > 0 ? alert.compareProtocols[0] : 'compound';

      switch (condition.conditionType) {
        case 'APR_RISE_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> APR rises above {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_FALLS_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> APR falls below {formatThresholdValue(condition)}
            </span>
          );
        case 'APR_OUTSIDE_RANGE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> APR moves outside the range of {formatThresholdValue(condition)}
            </span>
          );
        case 'RATE_DIFF_ABOVE':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> rate difference is above {formatThresholdValue(condition)}
            </span>
          );
        case 'RATE_DIFF_BELOW':
          return (
            <span>
              Alert when <PlatformImage platform={platform} /> rate difference is below {formatThresholdValue(condition)}
            </span>
          );
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-theme-muted">
            {getConditionMessage(alert, condition)}{' '}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-5 w-5 hover:text-primary">
                    <Info size={14} />
                    <span className="sr-only">View all channels</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                  <div className="space-y-2">
                    <p>{getConditionMessage(alert, condition)}</p>
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
          </span>
        </div>
      ))}
    </div>
  );
};

export default ConditionsCell;
