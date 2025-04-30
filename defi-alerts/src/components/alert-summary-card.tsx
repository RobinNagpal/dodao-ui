import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AlertSummaryCardProps {
  title: string;
  count: number;
  marketAlerts: number;
  comparisonAlerts?: number;
  icon: ReactNode;
  className?: string;
}

export function AlertSummaryCard({
  title,
  count,
  marketAlerts,
  comparisonAlerts,
  icon,
  className,
}: AlertSummaryCardProps) {
  return (
    <Card className={`border-theme-border-primary ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <span className="text-2xl font-bold text-theme-primary">{count}</span>
        </div>
        <div className="text-sm text-theme-muted">
          {marketAlerts} market alerts
          {comparisonAlerts !== undefined && (
            <span className="ml-2">{comparisonAlerts} comparison alerts</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
