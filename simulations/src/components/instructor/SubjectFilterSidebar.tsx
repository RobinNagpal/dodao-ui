import { BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface SubjectWithCount {
  subject: BusinessSubject;
  count: number;
}

interface SubjectFilterSidebarProps {
  selectedSubject: BusinessSubject | 'ALL';
  setSelectedSubject: (subject: BusinessSubject | 'ALL') => void;
  assignedCaseStudies: Array<{ subject: BusinessSubject }>;
  assignedSubjectsWithCounts: SubjectWithCount[];
}

export default function SubjectFilterSidebar({
  selectedSubject,
  setSelectedSubject,
  assignedCaseStudies,
  assignedSubjectsWithCounts,
}: SubjectFilterSidebarProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <span>Subject Areas</span>
          </CardTitle>
          <CardDescription>Filter by Subject</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setSelectedSubject('ALL')}
            variant={selectedSubject === 'ALL' ? 'default' : 'ghost'}
            className={`w-full justify-between h-12 ${
              selectedSubject === 'ALL' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-current rounded-full"></div>
              <span>All Subjects</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-current">
              {assignedCaseStudies?.length || 0}
            </Badge>
          </Button>

          {assignedSubjectsWithCounts.map(({ subject, count }) => (
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
