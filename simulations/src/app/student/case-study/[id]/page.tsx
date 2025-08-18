import StudentCaseStudyClient from './StudentCaseStudyClient';

interface StudentCaseStudyPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentCaseStudyPage({ params }: StudentCaseStudyPageProps) {
  const { id } = await params;

  return <StudentCaseStudyClient caseStudyId={id} />;
}
