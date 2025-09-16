import AdminCaseStudyViewClient from './AdminCaseStudyViewClient';

export default async function AdminCaseStudyView({ params }: { params: Promise<{ caseStudyId: string }> }) {
  const { caseStudyId } = await params;

  return <AdminCaseStudyViewClient caseStudyId={caseStudyId} />;
}
