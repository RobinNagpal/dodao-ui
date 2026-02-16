'use client';

import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { StudentActivityLogsResponse } from '@/types/api';
import { buildExerciseLookup, transformLogsToFriendly } from '@/utils/activityLogUtils';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import FriendlyActivityLogTable from './FriendlyActivityLogTable';

interface ModuleInfo {
  id: string;
  orderNumber: number;
  title: string;
  exercises: {
    id: string;
    orderNumber: number;
    title: string;
  }[];
}

interface StudentActivityLogsProps {
  classEnrollmentId: string;
  studentEnrollmentId: string;
  modules: ModuleInfo[];
}

export default function StudentActivityLogs({ classEnrollmentId, studentEnrollmentId, modules }: StudentActivityLogsProps) {
  const { data: activityData, loading } = useFetchData<StudentActivityLogsResponse>(
    `${getBaseUrl()}/api/activity-logs/${classEnrollmentId}/students/${studentEnrollmentId}`,
    {},
    'Failed to load activity logs'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FullPageLoader message="Loading activity logs..." />
      </div>
    );
  }

  // Build exercise lookup from modules
  const exerciseLookup = buildExerciseLookup(modules);

  // Transform logs to friendly format
  const friendlyLogs = activityData?.logs ? transformLogsToFriendly(activityData.logs, exerciseLookup) : [];

  return (
    <FriendlyActivityLogTable
      logs={friendlyLogs}
      title="Activity Logs"
      emptyMessage="No activity has been recorded for this student yet."
      showUserColumn={false}
    />
  );
}
