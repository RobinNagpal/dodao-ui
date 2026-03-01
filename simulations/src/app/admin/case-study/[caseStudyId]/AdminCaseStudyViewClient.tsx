'use client';

import AdminNavbar from '@/components/navigation/AdminNavbar';
import ClassesTab from '@/components/instructor/case-study-tabs/ClassesTab';
import CaseStudyStepper from '@/components/shared/CaseStudyStepper';
import ViewCaseStudyInstructionsModal from '@/components/shared/ViewCaseStudyInstructionsModal';
import ViewExerciseModal from '@/components/shared/ViewExerciseModal';
import ViewModuleModal from '@/components/shared/ViewModuleModal';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { CaseStudyModule, ModuleExercise } from '@/types';
import type { CaseStudyWithRelationsForAdmin, CaseStudyWithRelationsForStudents, DeleteResponse, EnrollmentWithStudents } from '@/types/api';
import { getSubjectColor, getSubjectDisplayName, getSubjectIcon } from '@/utils/subject-utils';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import EllipsisDropdown from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { BookOpen, GraduationCap, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useState } from 'react';

type AdminTabType = 'overview' | 'classes';

interface CaseStudyViewClientProps {
  caseStudyId: string;
}

export default function AdminCaseStudyViewClient({ caseStudyId }: CaseStudyViewClientProps): ReactElement | null {
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CaseStudyModule | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ModuleExercise | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>('');

  const router = useRouter();

  // API hook to fetch case study data
  const {
    data: caseStudy,
    loading: loadingCaseStudy,
    reFetchData,
  } = useFetchData<CaseStudyWithRelationsForStudents>(`${getBaseUrl()}/api/case-studies/${caseStudyId}`, {}, 'Failed to load case study');

  // Fetch all class enrollments for this case study (admin sees all)
  const { data: enrollments, loading: loadingEnrollments } = useFetchData<EnrollmentWithStudents[]>(
    `${getBaseUrl()}/api/case-studies/${caseStudyId}/class-enrollments`,
    { skipInitialFetch: activeTab !== 'classes' },
    'Failed to load class enrollments'
  );

  const { renderAuthGuard } = useAuthGuard({
    allowedRoles: 'Admin',
    loadingType: 'admin',
    loadingText: 'Loading case study...',
    loadingSubtitle: 'Preparing case study details...',
    additionalLoadingConditions: [loadingCaseStudy],
  });

  const {
    data,
    loading,
    postData: duplicateCaseStudy,
    error,
  } = usePostData<CaseStudyWithRelationsForStudents, never>({
    successMessage: 'Case study duplicated successfully!',
    errorMessage: 'Failed to duplicated case study',
  });

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

  const modules = caseStudy?.modules || [];

  const actions = [
    { key: 'delete', label: 'Delete' },
    { key: 'duplicate', label: 'Duplicate' },
  ];

  const { deleteData: deleteCaseStudy, loading: deletingCaseStudy } = useDeleteData<DeleteResponse, never>({
    successMessage: 'Case study deleted successfully!',
    errorMessage: 'Failed to delete case study',
  });

  const handleEditCaseStudy = (caseStudyId: string): void => {
    router.push(`/admin/edit/${caseStudyId}`);
  };

  const handleDeleteCaseStudy = (caseStudyId: string): void => {
    setDeleteId(caseStudyId);
    setShowDeleteConfirm(true);
  };

  const handleDuplicateCaseStudy = async (caseStudyId: string): Promise<void> => {
    const response = await duplicateCaseStudy(`/api/case-studies/${caseStudyId}/duplicate`);
    if (response) {
      router.push(`/admin/case-study/${response.id}`);
    }
  };
  const handleConfirmDelete = async (): Promise<void> => {
    try {
      await deleteCaseStudy(`/api/case-studies/${deleteId}`);
      setShowDeleteConfirm(false);
      setDeleteId('');

      router.push('/admin');
    } catch (error: unknown) {
      console.error('Error deleting case study:', error);
    }
  };

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return loadingGuard as ReactElement;

  // Build a caseStudy-like object with enrollments for ClassesTab
  const caseStudyWithEnrollments: CaseStudyWithRelationsForAdmin | null = caseStudy
    ? ({ ...caseStudy, enrollments: enrollments ?? [] } as CaseStudyWithRelationsForAdmin)
    : null;

  const basePath = '/admin';

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Dashboard', href: `${basePath}`, current: false },
    {
      name: caseStudy?.title || 'Case Study',
      href: `${basePath}/case-study/${caseStudyId}`,
      current: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <AdminNavbar title={caseStudy?.title || 'Case Study Not Found'} subtitle="Case Study Details" icon={<Shield className="h-8 w-8 text-white" />} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          <EllipsisDropdown
            items={actions}
            className="flex items-center shrink-0"
            onSelect={async (key) => {
              if (key === 'edit') {
                handleEditCaseStudy(caseStudyId);
              } else if (key === 'delete') {
                handleDeleteCaseStudy(caseStudyId);
              } else if (key === 'duplicate') {
                handleDuplicateCaseStudy(caseStudyId);
              } else {
                console.error(`Unknown action key: ${key}`);
              }
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-white/20 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'text-emerald-600 bg-emerald-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-4 px-2 pb-2 relative font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                activeTab === 'classes'
                  ? 'text-emerald-600 bg-emerald-50/50 rounded-t-lg after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Classes</span>
            </button>
          </nav>
        </div>

        {activeTab === 'classes' && <ClassesTab caseStudy={caseStudyWithEnrollments} caseStudyId={caseStudyId} linkBasePath="/admin" />}

        {activeTab === 'overview' && modules.length > 0 && (
          <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`bg-gradient-to-r ${getSubjectColor(caseStudy?.subject || 'MARKETING')} text-white border-0 text-sm px-3 py-1`}>
                    <span className="mr-2">{getSubjectIcon(caseStudy?.subject || 'MARKETING')}</span>
                    {getSubjectDisplayName(caseStudy?.subject || 'MARKETING')}
                  </Badge>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    <GraduationCap className="h-3 w-3 mr-1" />
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
              <CardDescription className="text-base text-gray-700 leading-relaxed mb-4">
                {caseStudy?.shortDescription || 'No description available.'}
              </CardDescription>

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

        {caseStudy && (
          <ViewCaseStudyInstructionsModal
            open={showCaseStudyModal}
            onClose={() => setShowCaseStudyModal(false)}
            caseStudy={caseStudy}
            hasCaseStudyInstructionsRead={() => true} // Admin always has read instructions
            handleMarkInstructionAsRead={async () => {}} // No-op for admin
            updatingStatus={false}
            onCaseStudyUpdate={async (updatedCaseStudy) => {
              await reFetchData();
            }}
            allowEdit={true}
          />
        )}

        {selectedModule && showModuleModal && (
          <ViewModuleModal
            open={showModuleModal}
            onClose={() => {
              setShowModuleModal(false);
              setSelectedModule(null);
              setSelectedExercise(null);
            }}
            selectedModule={selectedModule}
            hasModuleInstructionsRead={() => true} // Admin always has read instructions
            handleMarkInstructionAsRead={async () => {}} // No-op for admin
            updatingStatus={false}
            caseStudy={caseStudy}
            onModuleUpdate={async (updatedModule) => {
              await reFetchData();
            }}
            allowEdit={true}
          />
        )}

        {selectedExercise && showExerciseModal && (
          <ViewExerciseModal
            open={showExerciseModal}
            onClose={() => {
              setShowExerciseModal(false);
              setSelectedExercise(null);
              setSelectedModule(null);
            }}
            exercise={selectedExercise}
            moduleTitle={selectedModule?.title}
            moduleNumber={selectedModule?.orderNumber}
            caseStudy={caseStudy}
            moduleId={selectedModule?.id}
            onExerciseUpdate={async (updatedExercise) => {
              await reFetchData();
            }}
            allowEdit={true}
            isAdmin={true}
          />
        )}

        <ConfirmationModal
          open={showDeleteConfirm}
          showSemiTransparentBg={true}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          confirming={deletingCaseStudy}
          title="Delete Case Study"
          confirmationText="Are you sure you want to delete this case study? This action cannot be undone."
          askForTextInput={false}
        />
      </div>
    </div>
  );
}
