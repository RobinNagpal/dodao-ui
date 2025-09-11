import { BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface SubjectWithCount {
  subject: BusinessSubject;
  count: number;
}

interface SubjectFilterProps {
  selectedSubject: BusinessSubject | 'ALL';
  setSelectedSubject: (subject: BusinessSubject | 'ALL') => void;
  studies: Array<{ subject: BusinessSubject }>;
  subjectsWithCounts?: SubjectWithCount[];
  title?: string;
  description?: string;
  highlightGradient?: string;
}

export default function SubjectFilter({
  selectedSubject,
  setSelectedSubject,
  studies,
  subjectsWithCounts,
  title = 'Subject Areas',
  description = 'Filter by Subject',
  highlightGradient = 'from-amber-500 to-orange-600',
}: SubjectFilterProps) {
  const getSubjectsWithCounts = (): SubjectWithCount[] => {
    if (subjectsWithCounts) return subjectsWithCounts;
    if (!studies) return [];

    const subjects: BusinessSubject[] = ['MARKETING', 'FINANCE', 'HR', 'OPERATIONS', 'ECONOMICS'];
    return subjects
      .map((subject) => ({
        subject,
        count: studies.filter((cs) => cs.subject === subject).length,
      }))
      .filter((item) => item.count > 0);
  };

  const displaySubjectsWithCounts = subjectsWithCounts || getSubjectsWithCounts();

  return (
    <div className="w-80 flex-shrink-0">
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-gray-600" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setSelectedSubject('ALL')}
            variant={selectedSubject === 'ALL' ? 'default' : 'ghost'}
            className={`w-full justify-between h-12 ${
              selectedSubject === 'ALL' ? `bg-gradient-to-r ${highlightGradient} text-white shadow-lg` : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-current rounded-full"></div>
              <span>All Subjects</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-current">
              {studies?.length || 0}
            </Badge>
          </Button>

          {displaySubjectsWithCounts.map(({ subject, count }) => (
            <Button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              variant={selectedSubject === subject ? 'default' : 'ghost'}
              className={`w-full justify-between h-12 ${
                selectedSubject === subject ? `bg-gradient-to-r ${highlightGradient} text-white shadow-lg` : 'hover:bg-gray-50'
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
