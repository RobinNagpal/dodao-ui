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
  onEvaluateAttempt: (attemptId: string, exerciseId: string, studentId: string) => void;
  onStartBulkEvaluation: (studentId: string, studentEmail: string) => void;
  clearingAttempts: boolean;
  deletingAttempt: boolean;
  evaluatingAttempts: Set<string>;
}

const StudentsTab: FC<StudentsTabProps> = ({
  students,
  modules,
  onViewStudentDetails,
  onClearStudentAttempts,
  onDeleteAttempt,
  onDeleteFinalSummary,
  onEvaluateAttempt,
  onStartBulkEvaluation,
  clearingAttempts,
  deletingAttempt,
  evaluatingAttempts,
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
        onEvaluateAttempt={onEvaluateAttempt}
        onStartBulkEvaluation={onStartBulkEvaluation}
        clearingAttempts={clearingAttempts}
        deletingAttempt={deletingAttempt}
        evaluatingAttempts={evaluatingAttempts}
      />
    </div>
  );
};

export default StudentsTab;
