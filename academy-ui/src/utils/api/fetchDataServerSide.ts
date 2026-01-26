import fetchDataServerSideCore from '@dodao/web-core/ui/hooks/fetchDataServerSideCore';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export default async function fetchDataServerSide<T>(url: string, options: RequestInit = {}): Promise<T> {
  return fetchDataServerSideCore(url, authOptions, options);
}
