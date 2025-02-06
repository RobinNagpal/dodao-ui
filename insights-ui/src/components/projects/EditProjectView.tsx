'use client';

import { useEffect, useState } from 'react';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import { submitProject } from '@/util/submit-project'; // Importing your function
import { ProjectDetails } from '@/types/project/project';
import { ProjectSubmissionData } from '@/types/project/project';
import { useRouter } from 'next/navigation';
import UploadInput from '@dodao/web-core/components/core/uploadInput/UploadInput';
import { uploadImageToS3 } from '@/util/upload-image';

export default function EditProjectView(props: { projectId?: string | null; projectDetails?: ProjectDetails }) {
  const { projectId, projectDetails } = props;
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [projectUpserting, setProjectUpserting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [project, setProject] = useState<ProjectSubmissionData>({
    projectId: projectDetails?.id || 'project_id',
    projectName: projectDetails?.name || 'project name',
    projectImgUrl: projectDetails?.imgUrl || '',
    crowdFundingUrl: projectDetails?.projectInfoInput.crowdFundingUrl || 'Crowd Funding Url',
    websiteUrl: projectDetails?.projectInfoInput.websiteUrl || 'website url',
    secFilingUrl: projectDetails?.projectInfoInput.secFilingUrl || 'sec filing Url',
    additionalUrls: projectDetails?.projectInfoInput.additionalUrls || [],
  });
  const handleImageUpload = async (file: File) => {
    setLoading(true);
    const url = await uploadImageToS3(file, project.projectId);
    console.log('Image uploaded to:', url);
    setProject((prev) => ({ ...prev, projectImgUrl: url }));
    setLoading(false);
  };
  useEffect(() => {
    setIsMounted(true);
  });
  const handleUpdateField = (field: keyof ProjectSubmissionData, value: string) => {
    console.log('Updating field:', field, 'with value:', value);
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProject = async () => {
    setProjectUpserting(true);

    try {
      const response = await submitProject(project);

      if (response.success) {
        router.push(`/crowd-funding/projects/${project.projectId}`);
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
    <Block title="Project Information" className="font-semibold text-color">
      <div className="mb-8 text-color">
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
          error={project.projectName == '' ? 'Project Name is required' : ''}
          placeholder="Enter Project Name"
          maxLength={64}
          className="text-color"
          onUpdate={(e) => handleUpdateField('projectName', e as string)}
        >
          Project Name *
        </Input>

        <UploadInput
          spaceId={''}
          modelValue={project.projectImgUrl}
          label="Project Image"
          uploadToS3={handleImageUpload}
          loading={loading}
          onInput={(e) => handleUpdateField('projectImgUrl', e as string)}
        ></UploadInput>

        <Input
          modelValue={project.crowdFundingUrl}
          error={project.crowdFundingUrl == '' ? 'Crowdfunding Link is required' : ''}
          placeholder="Enter Crowdfunding Link"
          className="text-color"
          onUpdate={(e) => handleUpdateField('crowdFundingUrl', e as string)}
        >
          Crowdfunding Link *
        </Input>

        <Input
          modelValue={project.websiteUrl}
          error={project.websiteUrl == '' ? 'Website URL is required' : ''}
          placeholder="Enter Website URL"
          className="text-color"
          onUpdate={(e) => handleUpdateField('websiteUrl', e as string)}
        >
          Website URL *
        </Input>

        <Input
          modelValue={project.secFilingUrl}
          error={project.secFilingUrl == '' ? 'Latest SEC Filing Link is required' : ''}
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
              className="text-color mb-6 mr-4"
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
              className="text-red-500 mb-2"
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
  );
}
