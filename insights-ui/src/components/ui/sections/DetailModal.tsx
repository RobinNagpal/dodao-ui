'use client';

import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import React from 'react';

/**
 * Modal for the detail behind a selected item, e.g. the rate breakdown of one matrix cell. Wraps
 * web-core's `FullPageModal` (focus trap, Esc / click-outside to close, close button) with a
 * left-aligned title, padded body and a reading width suited to a small table.
 */

export interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function DetailModal({ open, onClose, title, children }: DetailModalProps): React.JSX.Element {
  return (
    <FullPageModal
      open={open}
      onClose={onClose}
      title={<span className="block px-5 pt-3 text-left text-lg font-semibold text-heading sm:px-6">{title}</span>}
      className="w-full max-w-5xl px-2 sm:px-0"
    >
      <div className="max-h-[75vh] overflow-y-auto px-5 pb-4 pt-4 text-left [--scroll-cover:var(--bg-color)] sm:px-6">{children}</div>
    </FullPageModal>
  );
}
