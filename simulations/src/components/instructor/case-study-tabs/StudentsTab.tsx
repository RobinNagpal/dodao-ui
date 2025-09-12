import { FC } from 'react';
import StudentTable from '@/components/instructor/StudentTable';
import type { StudentTableData, ModuleTableData } from '@/types';

interface StudentsTabProps {
  students: StudentTableData[];
  modules: ModuleTableData[];
  onViewStudentDetails: (studentId: string) => void;
  onClearStudentAttempts: (studentId: string, studentEmail: string) => void;
  onDeleteAttempt: (attemptId: string, studentId: string, studentEmail: string, exerciseTitle: string) => void;
  onDeleteFinalSummary: (finalSummaryId: string, studentId: string, studentEmail: string) => void;
  clearingAttempts: boolean;
  deletingAttempt: boolean;
}

const StudentsTab: FC<StudentsTabProps> = ({
  students,
  modules,
  onViewStudentDetails,
  onClearStudentAttempts,
  onDeleteAttempt,
  onDeleteFinalSummary,
  clearingAttempts,
  deletingAttempt,
}) => {
  return (
    <div className="space-y-8">
      <StudentTable
        students={students}
        modules={modules}
        onViewStudentDetails={onViewStudentDetails}
        onClearStudentAttempts={onClearStudentAttempts}
        onDeleteAttempt={onDeleteAttempt}
        onDeleteFinalSummary={onDeleteFinalSummary}
        clearingAttempts={clearingAttempts}
        deletingAttempt={deletingAttempt}
      />
    </div>
  );
};

export default StudentsTab;
