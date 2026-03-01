import { Metadata } from 'next';
import StudentDetailsClient from '@/components/shared/StudentDetailsClient';

interface PageProps {
  params: Promise<{ caseStudyId: string; classEnrollmentId: string; studentEnrollmentId: string }>;
}

export const metadata: Metadata = {
  title: 'Student Details - Admin',
  description: 'Detailed view of student progress and attempts',
};

export default async function StudentDetailsPage({ params }: PageProps) {
  const { caseStudyId, classEnrollmentId, studentEnrollmentId } = await params;

  return <StudentDetailsClient variant="admin" caseStudyId={caseStudyId} classEnrollmentId={classEnrollmentId} studentEnrollmentId={studentEnrollmentId} />;
}
