import CaseStudyManagementClient from './CaseStudyManagement';

export default async function InstructorCaseStudyManagement({ params }: { params: Promise<{ caseStudyId: string }> }) {
  const { caseStudyId } = await params;

  return <CaseStudyManagementClient caseStudyId={caseStudyId} />;
}
