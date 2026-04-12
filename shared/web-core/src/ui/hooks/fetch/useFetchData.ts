import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useDeepCompareMemoize } from '@dodao/web-core/ui/hooks/fetch/useDeepCompareMemoize';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export interface UseFetchDataResponse<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  reFetchData: () => Promise<T | undefined>;
}

export const useFetchData = <T>(
  url: string,
  options: RequestInit & {
    skipInitialFetch?: boolean;
  } = {},
  errorMessage: string
): UseFetchDataResponse<T> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const { showNotification } = useNotificationContext();

  // Use the custom memoization hook
  const memoizedOptions = useDeepCompareMemoize(options);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem(DODAO_ACCESS_TOKEN_KEY);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(memoizedOptions.headers || {}),
        ...(accessToken ? { 'dodao-auth-token': accessToken } : {}),
      } as Record<string, string>;

      const response = await fetch(url, {
        ...memoizedOptions,
        headers,
      });

      setLoading(false);
      if (!response.ok) {
        if (response.status === 401) {
          showNotification({ type: 'error', message: 'Your session has expired. Please log in again.' });
          localStorage.removeItem(DODAO_ACCESS_TOKEN_KEY);
          await signOut({ redirect: true, callbackUrl: `/login?updated=${Date.now()}` });
          return;
        }
        const errorText = await response.text();
        setError(errorText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setData(data);
      return data;
    } catch (error) {
      console.error(error);
      setError((error as any)?.message || String(error));
      setLoading(false);
      showNotification({ type: 'error', message: errorMessage });
    }
  }, [url, memoizedOptions, errorMessage, showNotification]);

  useEffect(() => {
    if (!memoizedOptions.skipInitialFetch) {
      fetchData();
    }
  }, [fetchData, memoizedOptions.skipInitialFetch]);

  const reFetchData = useCallback(async () => {
    const refetchResponse = await fetchData();
    setData(refetchResponse);
    return refetchResponse;
  }, [fetchData]);
  return {
    data,
    error,
    loading,
    reFetchData,
  };
};
