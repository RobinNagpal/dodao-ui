'use client';

import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ActivityLogsResponse } from '@/types/api';
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

interface InstructorActivityLogsProps {
  classEnrollmentId: string;
  modules: ModuleInfo[];
}

export default function InstructorActivityLogs({ classEnrollmentId, modules }: InstructorActivityLogsProps) {
  const { data: activityData, loading } = useFetchData<ActivityLogsResponse>(
    `${getBaseUrl()}/api/activity-logs/${classEnrollmentId}`,
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

  // Transform student logs to friendly format
  const friendlyLogs = activityData?.studentLogs ? transformLogsToFriendly(activityData.studentLogs, exerciseLookup) : [];

  return (
    <FriendlyActivityLogTable
      logs={friendlyLogs}
      title="Student Activity Logs"
      emptyMessage="No student activity has been recorded for this class yet."
      showUserColumn={true}
    />
  );
}
