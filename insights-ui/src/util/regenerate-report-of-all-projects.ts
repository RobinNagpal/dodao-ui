import { getAuthKey } from './auth/authKey';

export async function regenerateAReportOfAllProjects(projectIds: string[], model: string, reportType: string): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || 'https://ai-insights.dodao.io';

  try {
    const response = await fetch(`${baseURL}/api/projects/reports/${reportType}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': getAuthKey(),
      },
      body: JSON.stringify({ model, projectIds }),
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
