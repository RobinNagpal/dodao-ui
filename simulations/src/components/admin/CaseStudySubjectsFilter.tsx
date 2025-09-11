import { BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface CaseStudyListItem {
  id: string;
  title: string;
  shortDescription: string;
  subject: BusinessSubject;
  createdBy: string | null;
  createdAt: string;
  modules: Array<{
    id: string;
  }>;
}

interface CaseStudySubjectsFilterProps {
  caseStudies: CaseStudyListItem[];
  selectedSubject: BusinessSubject | 'ALL';
  setSelectedSubject: (subject: BusinessSubject | 'ALL') => void;
}

interface SubjectWithCount {
  subject: BusinessSubject;
  count: number;
}

export default function CaseStudySubjectsFilter({ caseStudies, selectedSubject, setSelectedSubject }: CaseStudySubjectsFilterProps) {
  const getCaseStudySubjectsWithCounts = (): SubjectWithCount[] => {
    if (!caseStudies) return [];

    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: caseStudies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0);
  };

  const caseStudySubjectsWithCounts = getCaseStudySubjectsWithCounts();

  return (
    <div className="w-80 flex-shrink-0">
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span>Subject Areas</span>
          </CardTitle>
          <CardDescription>Filter by Subject</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setSelectedSubject('ALL')}
            variant={selectedSubject === 'ALL' ? 'default' : 'ghost'}
            className={`w-full justify-between h-12 ${
              selectedSubject === 'ALL' ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' : 'hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-current rounded-full"></div>
              <span>All Subjects</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-current">
              {caseStudies?.length || 0}
            </Badge>
          </Button>

          {caseStudySubjectsWithCounts.map(({ subject, count }) => (
            <Button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              variant={selectedSubject === subject ? 'default' : 'ghost'}
              className={`w-full justify-between h-12 ${
                selectedSubject === subject ? `bg-gradient-to-r ${getSubjectColor(subject)} text-white shadow-lg` : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getSubjectIcon(subject)}</span>
                <span className="font-medium">{getSubjectDisplayName(subject)}</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-current">
                {count}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
