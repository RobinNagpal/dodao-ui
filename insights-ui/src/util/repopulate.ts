import { RepopulatableFields } from '@/types/project/project';
import { getAuthKey } from './auth/authKey';

export async function repopulateProjectField(projectId: string, field: RepopulatableFields): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';

  try {
    const response = await fetch(`${baseURL}/api/projects/${projectId}/repopulate/${field}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': getAuthKey(),
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        message: responseData.message || 'Field repopulated successfully.',
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || 'Unable to repopulate field.',
    };
  } catch (error) {
    console.error('Error during field repopulation:', error);
    return {
      success: false,
      message: 'An error occurred while repopulating the field.',
    };
  }
}
