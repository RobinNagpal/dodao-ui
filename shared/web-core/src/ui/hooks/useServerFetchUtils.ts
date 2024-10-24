import { Session } from '@dodao/web-core/types/auth/Session';
import { authOptions } from 'academy-ui/src/app/api/auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth';

export default async function fetchDataServerSide<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (session) {
      options.headers = {
        ...(options.headers || {}),
        'dodao-auth-token': session?.dodaoAccessToken,
      };
    }
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error('Not able to fetch data from ' + url);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
