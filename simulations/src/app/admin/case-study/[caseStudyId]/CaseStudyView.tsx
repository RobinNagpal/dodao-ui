'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudyModule, ModuleExercise } from '@/types';
import type { CaseStudyWithRelations } from '@/types/api';
import { getSubjectDisplayName, getSubjectIcon, getSubjectColor } from '@/utils/subject-utils';
import { BookOpen, Brain } from 'lucide-react';
import AdminNavbar from '@/components/navigation/AdminNavbar';
import BackButton from '@/components/navigation/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CaseStudyStepper from '@/components/shared/CaseStudyStepper';
import ViewCaseStudyModal from '@/components/shared/ViewCaseStudyModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import ViewExerciseModal from '@/components/shared/ViewExerciseModal';
import AdminLoading from '@/components/admin/AdminLoading';

interface CaseStudyViewClientProps {
  caseStudyId: string;
}

export default function CaseStudyViewClient({ caseStudyId }: CaseStudyViewClientProps) {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CaseStudyModule | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ModuleExercise | null>(null);

  const router = useRouter();

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const email = localStorage.getItem('user_email');

    if (!userType || userType !== 'admin' || !email) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setIsLoading(false);
  }, [router]);

  // API hook to fetch case study data
  const {
    data: caseStudy,
    loading: loadingCaseStudy,
    reFetchData,
  } = useFetchData<CaseStudyWithRelations>(
    `/api/case-studies/${caseStudyId}?userType=admin&userEmail=${encodeURIComponent(userEmail)}`,
    { skipInitialFetch: !caseStudyId || !userEmail },
    'Failed to load case study'
  );

  const handleLogout = () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleModuleClick = (module: CaseStudyModule) => {
    setSelectedModule(module as any);
    setShowModuleModal(true);
  };

  const handleExerciseClick = (exerciseId: string, moduleId: string) => {
    const caseStudyModule = caseStudy?.modules?.find((m) => m.id === moduleId);
    const exercise = caseStudyModule?.exercises?.find((e) => e.id === exerciseId);
    if (exercise && caseStudyModule) {
      setSelectedModule(caseStudyModule as any);
      setSelectedExercise(exercise as any);
      setShowExerciseModal(true);
    }
  };

  if (isLoading || loadingCaseStudy) {
    return <AdminLoading text="Loading case study..." subtitle="Preparing case study details..." />;
  }

  if (!caseStudy || !caseStudyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center bg-white/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl border border-emerald-100 max-w-md">
          <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Case Study Not Found</h3>
          <p className="text-gray-600 mb-6">The case study you’re looking for doesn’t exist or has been removed.</p>
          <Button
            onClick={() => router.push('/admin')}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const modules = caseStudy?.modules || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <AdminNavbar
        title={caseStudy.title}
        subtitle="Case Study Details"
        userEmail={userEmail}
        onLogout={handleLogout}
        icon={<BookOpen className="h-8 w-8 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Back Button */}
        <BackButton userType="admin" text="Back to Dashboard" href="/admin" />

        <Card className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-green-50/80 border-white/20 shadow-lg mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy.subject)} text-white border-0 text-sm px-3 py-1`}>
                  <span className="mr-2">{getSubjectIcon(caseStudy.subject)}</span>
                  {getSubjectDisplayName(caseStudy.subject)}
                </Badge>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Brain className="h-3 w-3 mr-1" />
                  Admin View
                </Badge>
              </div>

              <Button
                onClick={() => setShowCaseStudyModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Case Study Details
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Case Study Overview</CardTitle>
            <CardDescription className="text-base text-gray-700 leading-relaxed">{caseStudy.shortDescription}</CardDescription>
          </CardHeader>
        </Card>

        {modules.length > 0 && (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Learning Path</CardTitle>
              </div>
              <CardDescription className="text-gray-600">Click on modules and exercises to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <CaseStudyStepper modules={modules as any} userType="admin" onModuleClick={handleModuleClick} onExerciseClick={handleExerciseClick} />
            </CardContent>
          </Card>
        )}

        <ViewCaseStudyModal
          open={showCaseStudyModal}
          onClose={() => setShowCaseStudyModal(false)}
          caseStudy={caseStudy}
          hasCaseStudyInstructionsRead={() => true} // Admin always has read instructions
          handleMarkInstructionAsRead={async () => {}} // No-op for admin
          updatingStatus={false}
          onCaseStudyUpdate={async (updatedCaseStudy) => {
            await reFetchData();
          }}
        />

        <ViewModuleModal
          open={showModuleModal}
          onClose={() => setShowModuleModal(false)}
          selectedModule={selectedModule}
          hasModuleInstructionsRead={() => true} // Admin always has read instructions
          handleMarkInstructionAsRead={async () => {}} // No-op for admin
          updatingStatus={false}
          caseStudy={caseStudy}
          onModuleUpdate={async (updatedModule) => {
            await reFetchData();
          }}
        />

        <ViewExerciseModal
          open={showExerciseModal}
          onClose={() => setShowExerciseModal(false)}
          exercise={selectedExercise}
          moduleTitle={selectedModule?.title}
          moduleNumber={selectedModule?.orderNumber}
          caseStudy={caseStudy}
          moduleId={selectedModule?.id}
          onExerciseUpdate={async (updatedExercise) => {
            await reFetchData();
          }}
        />
      </div>
    </div>
  );
}
