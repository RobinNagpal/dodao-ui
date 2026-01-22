'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';

interface AnalysisTemplateActionsProps {
  onEdit: () => void;
  onManage?: () => void;
  onSeeReport?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function AnalysisTemplateActions({ onEdit, onManage, onSeeReport, onDelete, className = 'px-2 py-2' }: AnalysisTemplateActionsProps) {
  const actions: EllipsisDropdownItem[] = [{ key: 'edit', label: 'Edit' }];

  if (onManage) {
    actions.push({ key: 'manage', label: 'Manage Template' });
  }

  if (onSeeReport) {
    actions.push({ key: 'see-report', label: 'See Report' });
  }

  if (onDelete) {
    actions.push({ key: 'delete', label: 'Delete' });
  }

  return (
    <EllipsisDropdown
      items={actions}
      className={className}
      onSelect={(key) => {
        if (key === 'edit') {
          onEdit();
        } else if (key === 'manage' && onManage) {
          onManage();
        } else if (key === 'see-report' && onSeeReport) {
          onSeeReport();
        } else if (key === 'delete' && onDelete) {
          onDelete();
        }
      }}
    />
  );
}
