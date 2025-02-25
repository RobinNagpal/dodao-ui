import { PublicEquitySubmissionData } from '@/types/public-equity/sector';
import { getAuthKey } from './auth/authKey';

export async function submitEquity(equityDetails: PublicEquitySubmissionData): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  console.log('Constructed URL:', `${baseURL}/api/public-equities/US/submit`);
  try {
    const response = await fetch(`${baseURL}/api/public-equities/US/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': getAuthKey(),
      },
      body: JSON.stringify(equityDetails),
    });

    if (response.ok) {
      const responseData = await response.json();
      return {
        success: true,
        message: responseData.message || 'Equity data submitted successfully.',
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || 'Unable to submit equity data',
    };
  } catch (error) {
    console.error('Error during equity data submission:', error);
    return {
      success: false,
      message: 'An error occurred while submitting equity data.',
    };
  }
}
