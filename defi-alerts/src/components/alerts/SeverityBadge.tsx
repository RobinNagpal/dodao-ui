import React from 'react';
import { Badge } from '@/components/ui/badge';

export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A reusable component for displaying severity badges with appropriate styling
 */
const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', children }) => {
  // Get severity badge color based on severity level
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NONE':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getSeverityColor(severity)} ${className}`}>
      {children || severity}
    </Badge>
  );
};

export default SeverityBadge;
