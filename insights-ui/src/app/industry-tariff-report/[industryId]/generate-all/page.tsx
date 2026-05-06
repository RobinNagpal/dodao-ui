import GenerateAllSections from './GenerateAllSections';

export default async function GenerateAllPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  return <GenerateAllSections industryId={industryId} />;
}
