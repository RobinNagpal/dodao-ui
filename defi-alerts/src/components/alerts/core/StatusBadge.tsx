import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertStatus } from '@/types/alerts';

interface AlertsBadgeProps {
  status: AlertStatus;
  showOnlyInactive?: boolean;
}

const StatusBadge: React.FC<AlertsBadgeProps> = ({ status, showOnlyInactive = false }) => {
  // If status is ACTIVE and showOnlyInactive is true, don't render anything
  if (status === 'ACTIVE' && showOnlyInactive) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={
        status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200' // Changed from yellow to red for inactive status
      }
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
};

export default StatusBadge;
