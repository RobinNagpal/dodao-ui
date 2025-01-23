export async function regenerateReport(projectId: string, reportType?: string): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  const url: string = reportType ? `reports/${reportType}/regenerate` : `reports/regenerate`;

  console.log('Constructed URL:', `${baseURL}/api/projects/${projectId}/${url}`);
  try {
    const response = await fetch(`${baseURL}/api/projects/${projectId}/${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
