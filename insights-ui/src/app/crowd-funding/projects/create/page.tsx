'use client';

import { useParams } from 'next/navigation';
import EditProjectView from '@/components/projects/EditProjectView';

export default function Page() {
  const params = useParams();
  const projectId = params?.projectId as string | null; // Get projectId from URL

  return <EditProjectView projectId={projectId} />;
}
