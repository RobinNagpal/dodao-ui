'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import { TagIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  onAddTags: () => void;
  onAddLists: () => void;
}

/**
 * Fixed bottom bar shown while items are selected in bulk-action mode.
 */
export default function BulkActionBar({ selectedCount, onAddTags, onAddLists }: BulkActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur border-t border-gray-700 px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-gray-100">
          <span className="font-bold text-white tabular-nums">{selectedCount}</span> {selectedCount === 1 ? 'item' : 'items'} selected
        </div>
        <div className="flex flex-nowrap gap-2">
          <Button onClick={onAddTags} variant="contained" primary className="inline-flex items-center text-sm">
            <TagIcon className="w-4 h-4 mr-1.5" />
            Add Tags
          </Button>
          <Button onClick={onAddLists} variant="contained" primary className="inline-flex items-center text-sm">
            <ListBulletIcon className="w-4 h-4 mr-1.5" />
            Add to Lists
          </Button>
        </div>
      </div>
    </div>
  );
}
