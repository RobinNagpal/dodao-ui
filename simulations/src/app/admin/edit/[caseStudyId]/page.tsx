import EditCaseStudyClient from './EditCaseStudy';

interface EditCaseStudyPageProps {
  params: Promise<{ caseStudyId: string }>;
}

export default async function EditCaseStudyPage({ params }: EditCaseStudyPageProps): Promise<JSX.Element> {
  const { caseStudyId } = await params;

  return <EditCaseStudyClient caseStudyId={caseStudyId} />;
}
