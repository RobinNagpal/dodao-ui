import { ProjectSubmissionData } from '@/types/project/project';
import { getAuthKey } from './auth/authKey';

export async function submitProject(projectDetails: ProjectSubmissionData): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  try {
    const response = await fetch(`${baseURL}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': getAuthKey(),
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
        message: responseData.message || 'Project submitted successfully.',
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || 'Unable to submit report',
    };
  } catch (error) {
    console.error('Error during project submission:', error);
    return {
      success: false,
      message: 'An error occurred while submitting project.',
    };
  }
}
