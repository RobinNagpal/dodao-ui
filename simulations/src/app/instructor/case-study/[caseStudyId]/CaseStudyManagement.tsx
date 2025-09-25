'use client';

import AnalyticsTab from '@/components/instructor/case-study-tabs/AnalyticsTab';
import OverviewTab from '@/components/instructor/case-study-tabs/OverviewTab';
import StudentsTab from '@/components/instructor/case-study-tabs/StudentsTab';
import TabNavigation, { TabType } from '@/components/instructor/case-study-tabs/TabNavigation';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import BackButton from '@/components/navigation/BackButton';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import ViewCaseStudyInstructionsModal from '@/components/shared/ViewCaseStudyInstructionsModal';
import ViewExerciseModal from '@/components/shared/ViewExerciseModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import type { CaseStudyModule, ModuleExercise } from '@/types';
import type { CaseStudyWithRelationsForInstructor, CaseStudyWithRelationsForAdmin } from '@/types/api';
import { SimulationSession } from '@/types/user';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { GraduationCap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CaseStudyManagementClientProps {
  caseStudyId: string;
}

export default function CaseStudyManagementClient({ caseStudyId }: CaseStudyManagementClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const router = useRouter();
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CaseStudyModule | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ModuleExercise | null>(null);

  // API hook to fetch case study data
  const { data: caseStudy, loading: loadingCaseStudy } = useFetchData<CaseStudyWithRelationsForInstructor | CaseStudyWithRelationsForAdmin>(
    `/api/case-studies/${caseStudyId}`,
    { skipInitialFetch: !caseStudyId || !session },
    'Failed to load case study'
  );

  const handleLogout = () => {
    router.push('/login');
  };

  const handleModuleClick = (module: CaseStudyModule) => {
    setSelectedModule(module as CaseStudyModule);
    setShowModuleModal(true);
  };

  const handleExerciseClick = (exerciseId: string, moduleId: string) => {
    const caseStudyModule = caseStudy?.modules?.find((m) => m.id === moduleId);
    const exercise = caseStudyModule?.exercises?.find((e) => e.id === exerciseId);
    if (exercise && caseStudyModule) {
      setSelectedModule(caseStudyModule as CaseStudyModule);
      setSelectedExercise(exercise as ModuleExercise);
      setShowExerciseModal(true);
    }
  };

  if (!session || (session.role !== 'Instructor' && session.role !== 'Admin')) {
    return null;
  }

  if (loadingCaseStudy) {
    return <InstructorLoading text="Loading Case Study" subtitle="Preparing management console..." variant="enhanced" />;
  }

  const modules = caseStudy?.modules || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"> </div>
      </div>

      <InstructorNavbar
        title={caseStudy?.title || 'Case Study Not Found'}
        subtitle="Instructor Management Console"
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6">
        <BackButton userType="instructor" text="Back to Dashboard" href="/instructor" />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            caseStudy={caseStudy}
            modules={modules}
            onShowCaseStudyModal={() => setShowCaseStudyModal(true)}
            onModuleClick={handleModuleClick}
            onExerciseClick={handleExerciseClick}
          />
        )}

        {activeTab === 'classes' && <StudentsTab caseStudy={caseStudy || null} caseStudyId={caseStudyId} />}

        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>

      {caseStudy && (
        <ViewCaseStudyInstructionsModal
          open={showCaseStudyModal}
          onClose={() => setShowCaseStudyModal(false)}
          caseStudy={caseStudy}
          hasCaseStudyInstructionsRead={() => true} // Instructor always has read instructions
          handleMarkInstructionAsRead={async () => {}} // No-op for instructor
          updatingStatus={false}
          onCaseStudyUpdate={(updatedCaseStudy) => {
            // Instructors don't edit, so this should not be called
            console.log('Instructor tried to update case study - this should not happen');
          }}
        />
      )}

      {selectedModule && (
        <ViewModuleModal
          open={showModuleModal}
          onClose={() => setShowModuleModal(false)}
          selectedModule={selectedModule}
          hasModuleInstructionsRead={() => true} // Instructor always has read instructions
          handleMarkInstructionAsRead={async () => {}} // No-op for instructor
          updatingStatus={false}
          caseStudy={caseStudy}
          onModuleUpdate={(updatedModule) => {
            // Instructors don't edit, so this should not be called
            console.log('Instructor tried to update module - this should not happen');
          }}
        />
      )}

      {selectedExercise && (
        <ViewExerciseModal
          open={showExerciseModal}
          onClose={() => setShowExerciseModal(false)}
          exercise={selectedExercise}
          moduleTitle={selectedModule?.title}
          moduleNumber={selectedModule?.orderNumber}
          caseStudy={caseStudy}
          moduleId={selectedModule?.id}
          onExerciseUpdate={(updatedExercise) => {
            // Instructors don't edit, so this should not be called
            console.log('Instructor tried to update exercise - this should not happen');
          }}
        />
      )}
    </div>
  );
}
