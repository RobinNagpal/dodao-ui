import axios from 'axios';

export async function getUsingApi<T>(args: { url: string; params?: any }): Promise<T | null> {
  const response = await axios.get(args.url, {
    params: args.params,
  });

  const space = response?.data as T;
  return response.status === 200 ? space : null;
}
