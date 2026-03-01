'use client';

import CaseStudiesTab from '@/components/admin/CaseStudiesTab';
import AdminLayout from '../layout';
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

  return (
    <AdminLayout 
      title="Admin Dashboard - Case Studies"
      subtitle="Manage all case studies"
      activeTab="case-studies"
    >
      <CaseStudiesTab
        caseStudies={caseStudies}
        filteredCaseStudies={filteredCaseStudies}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        loadingCaseStudies={loadingCaseStudies}
        onCreateCaseStudy={() => router.push('/admin/create')}
      />
    </AdminLayout>
  );
}