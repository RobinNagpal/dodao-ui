'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { TagIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface FavouritesToolbarProps {
  showBusinessAnalysis: boolean;
  onToggleBusinessAnalysis: (enabled: boolean) => void;
  bulkActionMode: boolean;
  onToggleBulkActionMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectedCount: number;
  onManageLists: () => void;
  onManageTags: () => void;
}

/**
 * Toolbar with the "show business summary" toggle and the primary actions
 * (select multiple / manage lists / manage tags), including the bulk-select
 * variant of the buttons.
 */
export default function FavouritesToolbar({
  showBusinessAnalysis,
  onToggleBusinessAnalysis,
  bulkActionMode,
  onToggleBulkActionMode,
  onSelectAll,
  onDeselectAll,
  selectedCount,
  onManageLists,
  onManageTags,
}: FavouritesToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <ToggleWithIcon label="Show Business Summary" enabled={showBusinessAnalysis} setEnabled={onToggleBusinessAnalysis} onClickOnLabel={true} />

      <div className="flex flex-wrap items-center gap-1.5">
        {bulkActionMode ? (
          <>
            <Button onClick={onToggleBulkActionMode} variant="outlined" className="inline-flex items-center text-sm">
              Cancel Selection
            </Button>
            <Button onClick={onSelectAll} variant="outlined" className="inline-flex items-center text-sm">
              Select All
            </Button>
            <Button onClick={onDeselectAll} variant="outlined" className="inline-flex items-center text-sm" disabled={selectedCount === 0}>
              Deselect All
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onToggleBulkActionMode} variant="outlined" className="inline-flex items-center text-sm">
              Select Multiple
            </Button>
            <Button onClick={onManageLists} variant="outlined" className="inline-flex items-center text-sm">
              <ListBulletIcon className="w-4 h-4 mr-1.5" />
              Manage Lists
            </Button>
            <Button onClick={onManageTags} variant="outlined" className="inline-flex items-center text-sm">
              <TagIcon className="w-4 h-4 mr-1.5" />
              Manage Tags
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
