import { BusinessSubject } from '@/types';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Eye, Trash2 } from 'lucide-react';

interface CaseStudyCardProps {
  caseStudy: {
    id: string;
    title: string;
    shortDescription: string;
    subject: BusinessSubject;
    createdBy: string | null;
    createdAt: string;
    modules: Array<{
      id: string;
    }>;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CaseStudyCard({ caseStudy, onView, onEdit, onDelete }: CaseStudyCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0`}>
              <span className="mr-1">{getSubjectIcon(caseStudy.subject)}</span>
              {getSubjectDisplayName(caseStudy.subject)}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onView(caseStudy.id)}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="View case study details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(caseStudy.id)}
              className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Edit case study"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(caseStudy.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete case study"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
          <span className="text-gray-500">by {caseStudy.createdBy}</span>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">Created: {new Date(caseStudy.createdAt).toLocaleDateString()}</div>
      </CardContent>
    </Card>
  );
}
