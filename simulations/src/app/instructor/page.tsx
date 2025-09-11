'use client';

import { SimulationSession } from '@/types/user';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import type { CaseStudy } from '@/types';
import type { BusinessSubject } from '@/types';
import { GraduationCap } from 'lucide-react';
import InstructorNavbar from '@/components/navigation/InstructorNavbar';
import InstructorLoading from '@/components/instructor/InstructorLoading';
import SubjectFilter from '@/components/common/SubjectFilter';
import CaseStudiesContent from '@/components/instructor/CaseStudiesContent';
import { getAssignedSubjectsWithCounts } from '@/components/instructor/SubjectUtils';

export default function InstructorDashboard() {
  const { data: simSession } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;

  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudy[]>([]);
  const router = useRouter();

  // API hook to fetch case studies
  const {
    data: assignedCaseStudies,
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudy[]>(`${getBaseUrl()}/api/case-studies`, {}, 'Failed to load assigned case studies');

  // Filter case studies based on selected subject
  useEffect(() => {
    if (assignedCaseStudies) {
      if (selectedSubject === 'ALL') {
        setFilteredCaseStudies(assignedCaseStudies);
      } else {
        setFilteredCaseStudies(assignedCaseStudies.filter((cs) => cs.subject === selectedSubject));
      }
    }
  }, [selectedSubject, assignedCaseStudies]);

  const handleLogout = (): void => {
    router.push('/login');
  };

  const assignedSubjectsWithCounts = getAssignedSubjectsWithCounts(assignedCaseStudies);

  if (!session || (session.role !== 'Instructor' && session.role !== 'Admin')) {
    return <div>You are not authorized to access this page</div>;
  }

  if (loadingCaseStudies || assignedCaseStudies === undefined) {
    return <InstructorLoading text="Loading Dashboard" subtitle="Preparing your instructor console..." variant="enhanced" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <InstructorNavbar
        title="Instructor Dashboard"
        subtitle="Welcome Back"
        userEmail={session?.email!}
        onLogout={handleLogout}
        icon={<GraduationCap className="h-8 w-8 text-white" />}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {assignedCaseStudies && assignedCaseStudies.length > 0 && (
            <SubjectFilter
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              studies={assignedCaseStudies}
              subjectsWithCounts={assignedSubjectsWithCounts}
              highlightGradient="from-purple-500 to-purple-600"
            />
          )}

          <CaseStudiesContent
            filteredCaseStudies={filteredCaseStudies}
            assignedCaseStudies={assignedCaseStudies || []}
            selectedSubject={selectedSubject}
            instructorEmail={session?.email!}
            refetchCaseStudies={refetchCaseStudies}
            highlightGradient="from-purple-500 to-purple-600"
            lightHighlightGradient="from-purple-100 to-purple-200"
            hoverGradient="from-purple-600 to-purple-700"
            shadowColor="shadow-purple-500/25"
          />
        </div>
      </div>
    </div>
  );
}
