import { ActivityLogWithUser } from '@/types/api';
import { Eye, User, GraduationCap, Clock, Settings } from 'lucide-react';

interface LogTableProps {
  logs: ActivityLogWithUser[];
  userType: 'instructor' | 'student';
  onViewDetails: (log: ActivityLogWithUser) => void;
}

export default function LogTable({ logs, userType, onViewDetails }: LogTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 400) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100/50 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <div className="flex items-center space-x-3">
          {userType === 'instructor' ? <GraduationCap className="h-6 w-6 text-emerald-600" /> : <User className="h-6 w-6 text-blue-600" />}
          <h3 className="text-lg font-bold text-gray-900 capitalize">{userType} Activity Logs</h3>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm font-medium">{logs.length} entries</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No activity logs</h4>
          <p className="text-gray-500">No {userType} activity has been recorded for this class yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${userType === 'instructor' ? 'bg-emerald-100' : 'bg-blue-100'}`}
                        >
                          {userType === 'instructor' ? <GraduationCap className="h-4 w-4 text-emerald-600" /> : <User className="h-4 w-4 text-blue-600" />}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{log.user.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded max-w-xs truncate" title={log.requestRoute}>
                      {log.requestRoute}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.requestMethod === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : log.requestMethod === 'POST'
                          ? 'bg-green-100 text-green-800'
                          : log.requestMethod === 'PUT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : log.requestMethod === 'DELETE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.requestMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>{log.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(log.createdAt.toString())}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(log)}
                      className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline transition-colors flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
