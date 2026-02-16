'use client';

import { User, Clock, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import { FriendlyActivityLog } from '@/utils/activityLogUtils';

interface FriendlyActivityLogTableProps {
  logs: FriendlyActivityLog[];
  title?: string;
  emptyMessage?: string;
  showUserColumn?: boolean;
}

export default function FriendlyActivityLogTable({
  logs,
  title = 'Activity Logs',
  emptyMessage = 'No activity has been recorded yet.',
  showUserColumn = true,
}: FriendlyActivityLogTableProps) {
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString();
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">No activity logs</h4>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">{logs.length} entries</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showUserColumn && <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>}
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                {showUserColumn && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        <div className="text-sm text-gray-500">{log.userEmail}</div>
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">{log.activity}</div>
                  {log.details && <div className="text-xs text-gray-500 mt-1">{log.details}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.isError ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(log.createdAt)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
