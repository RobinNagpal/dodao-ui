import { BusinessSubject } from '@/types';
import { CaseStudy } from '@/types';

export function getAssignedSubjectsWithCounts(assignedCaseStudies: CaseStudy[] | undefined): Array<{ subject: BusinessSubject; count: number }> {
  if (!assignedCaseStudies) return [];

  const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
  return subjects
    .map((subject) => ({
      subject,
      count: assignedCaseStudies.filter((cs) => cs.subject === subject).length,
    }))
    .filter((item) => item.count > 0);
}
