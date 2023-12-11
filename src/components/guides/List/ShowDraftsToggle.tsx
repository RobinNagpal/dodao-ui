'use client';

import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ShowDraftsToggleProps {
  showDrafts: boolean;
}
export default function ShowDraftsToggle({ showDrafts }: ShowDraftsToggleProps) {
  const router = useRouter();

  return (
    <div className="w-full mb-4 flex justify-end">
      <div className="w-52">
        <ToggleWithIcon label={'Show Draft'} enabled={showDrafts} setEnabled={(value) => router.push(`/guides?showDrafts=${value}`)} />
      </div>
    </div>
  );
}
