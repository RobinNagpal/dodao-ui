export default async function fetchDataServerSide<T>(url: string, options: RequestInit = {}): Promise<T | undefined> {
  try {
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
