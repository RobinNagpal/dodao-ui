'use client';

import ClassEnrollmentDetailPage from '@/components/shared/ClassEnrollmentDetailPage';
import React from 'react';

interface AdminClassEnrollmentPageProps {
  params: Promise<{
    caseStudyId: string;
    classEnrollmentId: string;
  }>;
}

export default function AdminClassEnrollmentPage({ params }: AdminClassEnrollmentPageProps) {
  const resolvedParams = React.use(params);
  const { caseStudyId, classEnrollmentId } = resolvedParams;

  return <ClassEnrollmentDetailPage caseStudyId={caseStudyId} classEnrollmentId={classEnrollmentId} userType="admin" />;
}
