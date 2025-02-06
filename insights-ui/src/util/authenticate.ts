import { setAuthKey } from './auth/authKey';

export async function authenticate(code: string): Promise<{ success: boolean; message: string }> {
  const baseURL = process.env.NEXT_PUBLIC_AGENT_APP_URL?.toString() || '';
  console.log('Constructed URL:', `${baseURL}/api/authenticate`);
  try {
    const response = await fetch(`${baseURL}/api/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
      }),
    });

    if (response.ok) {
      const responseData = await response.json();
      setAuthKey(responseData.key);
      return {
        success: true,
        message: 'Authenticated successfully.',
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      message: errorData.message || 'Unable to authenticate',
    };
  } catch (error) {
    console.error('Error during authenticating:', error);
    return {
      success: false,
      message: 'An error occurred while authenticating.',
    };
  }
}
