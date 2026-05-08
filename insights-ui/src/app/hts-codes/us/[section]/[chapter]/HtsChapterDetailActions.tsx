'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { revalidateHtsChapterDetailCache } from '@/utils/cache-actions';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';

export interface HtsChapterDetailActionsProps {
  chapterNumber: number;
}

export default function HtsChapterDetailActions({ chapterNumber }: HtsChapterDetailActionsProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [{ key: 'revalidate-chapter-tag', label: 'Invalidate Cache' }];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'revalidate-chapter-tag') {
            await revalidateHtsChapterDetailCache(chapterNumber);
            router.refresh();
            return;
          }
        }}
      />
    </PrivateWrapper>
  );
}
