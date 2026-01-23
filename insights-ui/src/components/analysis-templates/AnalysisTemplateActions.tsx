'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';

interface AnalysisTemplateActionsProps {
  onEdit: () => void;
  onGenerate?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function AnalysisTemplateActions({ onEdit, onGenerate, onDelete, className = 'px-2 py-2' }: AnalysisTemplateActionsProps) {
  const actions: EllipsisDropdownItem[] = [{ key: 'edit', label: 'Edit' }];

  if (onGenerate) {
    actions.push({ key: 'generate', label: 'Generate Analysis' });
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
        } else if (key === 'generate' && onGenerate) {
          onGenerate();
        } else if (key === 'delete' && onDelete) {
          onDelete();
        }
      }}
    />
  );
}
