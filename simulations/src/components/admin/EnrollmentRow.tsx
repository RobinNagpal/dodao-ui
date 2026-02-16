import { EnrollmentWithRelations } from '@/types/api';
import { Users, Activity } from 'lucide-react';

interface EnrollmentRowProps {
  enrollment: EnrollmentWithRelations;
  onManageStudents: (enrollment: EnrollmentRowProps['enrollment']) => void;
  onActivityLogs: (enrollment: EnrollmentRowProps['enrollment']) => void;
  onDelete: (enrollmentId: string) => void;
}

export default function EnrollmentRow({ enrollment, onManageStudents, onActivityLogs, onDelete }: EnrollmentRowProps) {
  return (
    <tr key={enrollment.id} className="hover:bg-emerald-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-gray-900">{enrollment.caseStudy.title}</div>
        <div className="text-sm text-emerald-600 font-medium">{enrollment.caseStudy.subject}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{enrollment.className || 'first section'}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 font-medium">{enrollment.assignedInstructor?.email || enrollment.assignedInstructorId}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 p-1 rounded-full">
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{enrollment.students?.length || 0}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{new Date(enrollment.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4 text-sm font-medium space-x-3">
        <button onClick={() => onManageStudents(enrollment)} className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline transition-colors">
          Manage Students
        </button>
        <button onClick={() => onActivityLogs(enrollment)} className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
          Activity Logs
        </button>
        <button onClick={() => onDelete(enrollment.id)} className="text-red-600 hover:text-red-800 font-medium hover:underline transition-colors">
          Delete
        </button>
      </td>
    </tr>
  );
}
