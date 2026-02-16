'use client';

import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ActivityLogsResponse, ActivityLogWithUser } from '@/types/api';
import { ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import JsonViewModal from '@/components/admin/JsonViewModal';
import LogTable from '@/components/admin/LogTable';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';

interface ActivityLogsPageProps {
  params: {
    classEnrollmentId: string;
  };
}

export default function ActivityLogsPage({ params }: ActivityLogsPageProps) {
  const { classEnrollmentId } = params;
  const [selectedLog, setSelectedLog] = useState<ActivityLogWithUser | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const { data: activityData, loading } = useFetchData<ActivityLogsResponse>(
    `${getBaseUrl()}/api/activity-logs/${classEnrollmentId}`,
    {},
    'Failed to load activity logs'
  );

  const handleViewDetails = (log: ActivityLogWithUser) => {
    setSelectedLog(log);
    setShowJsonModal(true);
  };

  if (loading) {
    return <FullPageLoader message="Loading activity logs..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-800 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Admin Dashboard</span>
          </Link>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Globe className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Activity Logs</h1>
            </div>

            {activityData?.enrollment && (
              <div className="text-gray-600">
                <p className="text-lg font-medium">{activityData.enrollment.className}</p>
                <p className="text-sm text-gray-500">Case Study: {activityData.enrollment.caseStudy.title}</p>
                <p className="text-sm">Instructor: {activityData.enrollment.assignedInstructor.name || activityData.enrollment.assignedInstructor.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="space-y-8">
          <LogTable logs={activityData?.instructorLogs || []} userType="instructor" onViewDetails={handleViewDetails} />
          <LogTable logs={activityData?.studentLogs || []} userType="student" onViewDetails={handleViewDetails} />
        </div>

        {/* JSON View Modal */}
        {selectedLog && (
          <JsonViewModal
            open={showJsonModal}
            onClose={() => {
              setShowJsonModal(false);
              setSelectedLog(null);
            }}
            title={`Activity Log Details - ${selectedLog.user.name || selectedLog.user.email}`}
            jsonData={selectedLog}
          />
        )}
      </div>
    </div>
  );
}
