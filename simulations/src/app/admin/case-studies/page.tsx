'use client';

import CaseStudiesTab from '@/components/admin/CaseStudiesTab';
import AdminTabLayout from '../AdminTabLayout';
import AdminLoading from '@/components/admin/AdminLoading';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { BusinessSubject } from '@/types';
import { CaseStudyWithRelationsForAdmin } from '@/types/api';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminCaseStudiesPage() {
  const [selectedSubject, setSelectedSubject] = useState<BusinessSubject | 'ALL'>('ALL');
  const [filteredCaseStudies, setFilteredCaseStudies] = useState<CaseStudyWithRelationsForAdmin[]>([]);
  const router = useRouter();

  const { session, renderAuthGuard } = useAuthGuard({
    allowedRoles: 'Admin',
    loadingType: 'admin',
    loadingText: 'Loading case studies...',
  });

  const {
    data: caseStudies = [],
    loading: loadingCaseStudies,
    reFetchData: refetchCaseStudies,
  } = useFetchData<CaseStudyWithRelationsForAdmin[]>(`${getBaseUrl()}/api/case-studies`, {}, 'Failed to load case studies');

  // Filter case studies based on selected subject
  useEffect(() => {
    if (selectedSubject === 'ALL') {
      setFilteredCaseStudies(caseStudies);
    } else {
      setFilteredCaseStudies(caseStudies.filter((cs) => cs.subject === selectedSubject));
    }
  }, [selectedSubject, caseStudies]);

  const loadingGuard = renderAuthGuard();
  if (loadingGuard) return <AdminLoading />;

  return (
    <AdminTabLayout userEmail={session?.email || session?.username}>
      <CaseStudiesTab
        caseStudies={caseStudies}
        filteredCaseStudies={filteredCaseStudies}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        loadingCaseStudies={loadingCaseStudies}
        onCreateCaseStudy={() => router.push('/admin/create')}
      />
    </AdminTabLayout>
  );
}