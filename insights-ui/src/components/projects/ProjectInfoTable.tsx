import React from 'react';

interface ProjectInfoInput {
  crowdFundingUrl: string;
  websiteUrl: string;
  secFilingUrl: string;
  additionalUrls?: string[];
}

interface ProjectInfoTableProps {
  initialProjectDetails: {
    projectInfoInput: ProjectInfoInput;
  };
}

export default function ProjectInfoTable({ initialProjectDetails }: ProjectInfoTableProps) {
  return (
    <div className="border-b border-gray-100 text-left">
      <dl className="divide-y text-color">
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-medium">Crowd Funding Link</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.crowdFundingUrl}</dd>
        </div>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-medium">Website Link</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.websiteUrl}</dd>
        </div>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm/6 font-medium">SEC Filing Link</dt>
          <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{initialProjectDetails.projectInfoInput.secFilingUrl}</dd>
        </div>
        {initialProjectDetails.projectInfoInput.additionalUrls && (
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium">Additional Links</dt>
            {initialProjectDetails.projectInfoInput.additionalUrls.map((url, index) => (
              <dd key={index} className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
                {url}
              </dd>
            ))}
          </div>
        )}
      </dl>
    </div>
  );
}
