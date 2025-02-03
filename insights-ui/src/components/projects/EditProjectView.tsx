'use client';

import { use, useEffect, useState } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { submitProject } from '@/util/submit-project'; // Importing your function
import { ProjectDetails } from '@/types/project/project';
import { ProjectSubmissionData } from '@/types/project/project';

export default function EditProjectView(props: { projectId?: string | null; projectDetails?: ProjectDetails }) {
  const { projectId, projectDetails } = props;
  const [projectUpserting, setProjectUpserting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [project, setProject] = useState<ProjectSubmissionData>({
    projectId: projectDetails?.id || '',
    projectName: projectDetails?.name || '',
    crowdFundingUrl: projectDetails?.projectInfoInput.crowdFundingUrl || '',
    websiteUrl: projectDetails?.projectInfoInput.websiteUrl || '',
    secFilingUrl: projectDetails?.projectInfoInput.secFilingUrl || '',
    additionalUrls: projectDetails?.projectInfoInput.additionalUrls || [],
  });

  useEffect(() => {
    setIsMounted(true);
  });
  const handleUpdateField = (field: keyof ProjectSubmissionData, value: string) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProject = async () => {
    setProjectUpserting(true);

    try {
      const response = await submitProject(project);

      if (response.success) {
        alert('Project submitted successfully!');
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error('Project submission failed:', error);
      alert('An error occurred while submitting the project.');
    } finally {
      setProjectUpserting(false);
    }
  };

  if (!isMounted) {
    return null;
  }
  return (
    <PageWrapper>
      <SingleCardLayout>
        <Block title="Project Information" className="font-semibold text-color">
          <div className="mb-8">
            <Input
              modelValue={project.projectId}
              error={project.projectId == null ? 'Project ID is required' : ''}
              placeholder="Enter Project ID"
              maxLength={32}
              className="text-color"
              onUpdate={(e) => handleUpdateField('projectId', e as string)}
            >
              Project ID *
            </Input>

            <Input
              modelValue={project.projectName}
              error={project.projectName == null ? 'Project Name is required' : ''}
              placeholder="Enter Project Name"
              maxLength={64}
              className="text-color"
              onUpdate={(e) => handleUpdateField('projectName', e as string)}
            >
              Project Name *
            </Input>

            <Input
              modelValue={project.crowdFundingUrl}
              error={project.crowdFundingUrl == null ? 'Crowdfunding Link is required' : ''}
              placeholder="Enter Crowdfunding Link"
              className="text-color"
              onUpdate={(e) => handleUpdateField('crowdFundingUrl', e as string)}
            >
              Crowdfunding Link *
            </Input>

            <Input
              modelValue={project.websiteUrl}
              error={project.websiteUrl == null ? 'Website URL is required' : ''}
              placeholder="Enter Website URL"
              className="text-color"
              onUpdate={(e) => handleUpdateField('websiteUrl', e as string)}
            >
              Website URL *
            </Input>

            <Input
              modelValue={project.secFilingUrl}
              error={project.secFilingUrl == null ? 'Latest SEC Filing Link is required' : ''}
              placeholder="Enter Latest SEC Filing URL"
              className="text-color"
              onUpdate={(e) => handleUpdateField('secFilingUrl', e as string)}
            >
              Latest SEC Filing Link *
            </Input>
          </div>

          {/* ✅ Additional Links Section */}
          <Block title="Additional Links" className="font-semibold mt-4 text-color">
            {project.additionalUrls.map((link, index) => (
              <div key={index} className="flex items-center mb-2">
                <Input
                  modelValue={link}
                  placeholder="Enter additional link"
                  className="text-color"
                  onUpdate={(e) => {
                    const updatedLinks = [...project.additionalUrls];
                    updatedLinks[index] = e as string;
                    setProject({ ...project, additionalUrls: updatedLinks });
                  }}
                />
                <Button
                  onClick={() =>
                    setProject({
                      ...project,
                      additionalUrls: project.additionalUrls.filter((_, i) => i !== index),
                    })
                  }
                  variant="text"
                  className="text-red-500"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => setProject({ ...project, additionalUrls: [...project.additionalUrls, ''] })} variant="outlined" className="mt-2">
              + Add Link
            </Button>
          </Block>

          <div className="flex justify-center items-center mt-6">
            <Button onClick={handleSaveProject} loading={projectUpserting} disabled={projectUpserting} className="block" variant="contained" primary>
              Save
            </Button>
          </div>
        </Block>
      </SingleCardLayout>
    </PageWrapper>
  );
}
