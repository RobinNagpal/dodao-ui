'use client';
import { ProjectDetails } from '@/types/project/project';
import { useRouter } from 'next/navigation';
import Thumbnail from '@dodao/web-core/components/app/Thumbnail';
import Card from '@dodao/web-core/components/core/card/Card';
import { shorten } from '@dodao/web-core/utils/utils';
import Link from 'next/link';
import React from 'react';
import { InsightsConstants } from '@/util/insights-constants';
import { regenerateReport } from '@/util/regenerate';
import EllipsisDropdown from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { isAdmin } from '@/util/auth/isAdmin';

interface ProjectSummaryCardProps {
  projectId: string;
}
const MODEL_OPTIONS = [
  { key: 'gpt-4o', label: 'gpt-4o' },
  { key: 'gpt-4o-mini', label: 'gpt-4o-mini' },
];

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ projectId }) => {
  const router = useRouter();

  const tableActions = {
    items: [
      { key: 'view', label: 'View' },
      { key: 'edit', label: 'Edit' },
      ...MODEL_OPTIONS.map((model) => ({
        key: `regenerate_${model.key}`,
        label: `Regenerate with ${model.label}`,
      })),
    ],
    onSelect: async (key: string, item: string) => {
      if (key === 'view') {
        router.push(`/crowd-funding/projects/${item}`);
      } else if (key === 'edit') {
        router.push(`/crowd-funding/projects/${item}/edit`);
      } else if (key.startsWith('regenerate_')) {
        const model = key.replace('regenerate_', '');
        const { success, message } = await regenerateReport(item, model);
        success ? router.refresh() : alert(message);
      }
    },
  };

  function formatProjectName(projectId: string): string {
    return projectId
      .trim() // Remove extra spaces
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
  }

  return (
    <Card>
      <Link href={`/crowd-funding/projects/${projectId}`} className="card blog-card w-inline-block h-full w-full">
        <div className="relative w-full">
          {
            <div className="absolute top-2 right-2 py-2 pl-3 pr-4 text-right font-medium sm:pr-0">
              <EllipsisDropdown
                items={tableActions.items}
                onSelect={(key) => {
                  tableActions.onSelect(key, projectId);
                }}
              />
            </div>
          }

          <Thumbnail
            src={`https://${InsightsConstants.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/images/${projectId}`}
            entityId={projectId}
            title={projectId}
            size="350"
            className="mb-1 w-full"
            max_tile_height="200px"
            big_tile={true}
            imageClass="w-full"
          />
        </div>

        <div className="p-4 text-center">
          <h2 className="text-color text-base font-bold whitespace-nowrap overflow-hidden overflow-ellipsis">{shorten(formatProjectName(projectId), 32)}</h2>
          <p className="text-color break-words mb-2 h-65px overflow-ellipsis overflow-hidden text-sm">{shorten(`This is a Crowd Funding Project`, 300)}</p>
        </div>
      </Link>
    </Card>
  );
};

export default ProjectSummaryCard;
