import { Metadata } from 'next';
import StudentDetailsClient from './StudentDetailsClient';

interface PageProps {
  params: Promise<{ caseStudyId: string; studentId: string }>;
}

export const metadata: Metadata = {
  title: 'Student Details - Instructor Dashboard',
  description: 'Detailed view of student progress and attempts',
};

export default async function StudentDetailsPage({ params }: PageProps) {
  const { caseStudyId, studentId } = await params;

  return <StudentDetailsClient caseStudyId={caseStudyId} studentId={studentId} />;
}
