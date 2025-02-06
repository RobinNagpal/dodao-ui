import { ProjectSubmissionData } from '@/types/project/project';

export async function submitProject(projectDetails: ProjectSubmissionData): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  console.log('Constructed URL:', `${baseURL}/api/submit`);
  try {
    const response = await fetch(`${baseURL}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectDetails.projectId,
        projectName: projectDetails.projectName,
        projectImgUrl: projectDetails.projectImgUrl,
        crowdFundingUrl: projectDetails.crowdFundingUrl,
        secFilingUrl: projectDetails.secFilingUrl,
        additionalUrls: projectDetails.additionalUrls,
        websiteUrl: projectDetails.websiteUrl,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        message: responseData.message || 'Report(s) regenerated successfully.',
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || 'Unable to regenerate report(s).',
    };
  } catch (error) {
    console.error('Error during report regeneration:', error);
    return {
      success: false,
      message: 'An error occurred while regenerating the report(s).',
    };
  }
}
