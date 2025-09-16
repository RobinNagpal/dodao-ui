import { FC } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CaseStudyStepper from '@/components/shared/CaseStudyStepper';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import type { CaseStudyModule, ModuleExercise } from '@/types';
import type { CaseStudyWithRelationsForStudents } from '@/types/api';

interface OverviewTabProps {
  caseStudy?: CaseStudyWithRelationsForStudents | null;
  modules: CaseStudyModule[];
  onShowCaseStudyModal: () => void;
  onModuleClick: (module: CaseStudyModule) => void;
  onExerciseClick: (exerciseId: string, moduleId: string) => void;
}

const OverviewTab: FC<OverviewTabProps> = ({ caseStudy, modules, onShowCaseStudyModal, onModuleClick, onExerciseClick }) => {
  if (modules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy?.subject || 'MARKETING')} text-white border-0 text-sm px-3 py-1`}>
                <span className="mr-2">{getSubjectIcon(caseStudy?.subject || 'MARKETING')}</span>
                {getSubjectDisplayName(caseStudy?.subject || 'MARKETING')}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                <GraduationCap className="h-3 w-3 mr-1" />
                Instructor View
              </Badge>
            </div>

            <Button
              onClick={onShowCaseStudyModal}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Case Study Details
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Case Study Overview</CardTitle>
          <CardDescription className="text-base text-gray-700 leading-relaxed mb-4">
            {caseStudy?.shortDescription || 'No description available.'}
          </CardDescription>

          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
          </div>
          <CardDescription className="text-gray-600">Click on modules and exercises to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <CaseStudyStepper modules={modules as any} userType="instructor" onModuleClick={onModuleClick} onExerciseClick={onExerciseClick} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
