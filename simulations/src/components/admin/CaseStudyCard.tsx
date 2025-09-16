import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessSubject } from '@/types';
import { getSubjectColor, getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import { User } from '@prisma/client';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

interface CaseStudyCardProps {
  caseStudy: {
    id: string;
    title: string;
    shortDescription: string;
    subject: BusinessSubject;
    createdBy: User;
    createdAt: string;
    modules: Array<{
      id: string;
    }>;
  };
}

export default function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <Link href={`/admin/case-study/${caseStudy.id}`} passHref>
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0`}>
                <span className="mr-1">{getSubjectIcon(caseStudy.subject)}</span>
                {getSubjectDisplayName(caseStudy.subject)}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{caseStudy.title}</CardTitle>
          <CardDescription className="text-gray-600 line-clamp-2">{caseStudy.shortDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-3">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-600 font-medium">{caseStudy.modules?.length || 0} modules</span>
            </div>
            <span className="text-gray-500">by {caseStudy.createdBy.name || caseStudy.createdBy.email}</span>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Created: {new Date(caseStudy.createdAt).toLocaleDateString()}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
