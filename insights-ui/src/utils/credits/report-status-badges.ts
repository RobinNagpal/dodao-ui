import type { StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { ReportSpendStatus } from '@/types/credits';

/**
 * One badge per paid-regeneration status, shared by the credits history and the
 * report pages so the same state always has the same colour and label.
 */
export const REPORT_STATUS_BADGES: Record<ReportSpendStatus, { variant: StatusBadgeVariant; label: string; spinning?: boolean }> = {
  InProgress: { variant: 'info', label: 'Being generated', spinning: true },
  Completed: { variant: 'success', label: 'Generated' },
  Failed: { variant: 'warning', label: 'Failed · not charged' },
};
