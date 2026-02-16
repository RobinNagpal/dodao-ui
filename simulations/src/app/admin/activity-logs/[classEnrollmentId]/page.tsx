import ActivityLogsPage from '@/components/admin/ActivityLogsPage';

interface PageProps {
  params: Promise<{
    classEnrollmentId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ActivityLogsPage params={resolvedParams} />;
}
