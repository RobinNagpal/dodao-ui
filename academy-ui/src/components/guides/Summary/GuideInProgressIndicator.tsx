'use client';

import styles from '@/components/guides/Summary/GuideSummaryCard.module.scss';
import guideSubmissionCache from '@/components/guides/View/guideSubmissionCache';
import { GuideSummaryFragment } from '@/graphql/generated/generated-types';
import React, { useEffect } from 'react';

export interface GuideSummaryCardProps {
  guide: GuideSummaryFragment;
}
export default function GuideInProgressIndicator({ guide }: GuideSummaryCardProps) {
  const [inProgress, setInProgress] = React.useState(false);
  useEffect(() => {
    const submissionsCache = guideSubmissionCache.readGuideSubmissionsCache(guide.id);
    if (submissionsCache && Object.values(submissionsCache.stepResponsesMap).some((s) => s.isCompleted)) {
      setInProgress(true);
    }
  }, []);

  return inProgress ? (
    <span className={`inline-flex items-center gap-x-1.5 rounded-md  px-2 py-1 text-xs font-medium text-green-700 ${styles.inProgressSpan}`}>
      <svg className="h-1.5 w-1.5 fill-white" viewBox="0 0 6 6" aria-hidden="true">
        <circle cx={3} cy={3} r={3} />
      </svg>
      In Progress
    </span>
  ) : null;
}
