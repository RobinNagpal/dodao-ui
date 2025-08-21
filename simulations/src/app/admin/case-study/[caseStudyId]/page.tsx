import CaseStudyViewClient from './CaseStudyView';

export default async function AdminCaseStudyView({ params }: { params: Promise<{ caseStudyId: string }> }) {
  const { caseStudyId } = await params;

  return <CaseStudyViewClient caseStudyId={caseStudyId} />;
}
