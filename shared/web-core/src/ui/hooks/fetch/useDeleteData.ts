import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { UpdateDataOptions } from '@dodao/web-core/ui/hooks/fetch/UpdateDataOptions';
import { useDeepCompareMemoize } from '@dodao/web-core/ui/hooks/fetch/useDeepCompareMemoize';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export interface UseDeleteDataResponse<T, R> {
  deleteData: (url: string, request?: R) => Promise<T | undefined>;
  loading: boolean;
  data: T | undefined;
  error: string | undefined;
}

export const useDeleteData = <RESPONSE_TYPE, REQUEST_TYPE>(
  options: RequestInit = {},
  updateOptions: UpdateDataOptions
): UseDeleteDataResponse<RESPONSE_TYPE, REQUEST_TYPE> => {
  const router = useRouter();
  // Separate state variables as per your request
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RESPONSE_TYPE | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const { showNotification } = useNotificationContext();

  // Memoize the options object internally
  const memoizedOptions = useDeepCompareMemoize(options);

  const deleteData = useCallback(
    async (url: string, body?: REQUEST_TYPE): Promise<RESPONSE_TYPE | undefined> => {
      setLoading(true);
      setError(undefined);
      setData(undefined); // Reset data before new request

      const accessToken = localStorage.getItem(DODAO_ACCESS_TOKEN_KEY);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(memoizedOptions.headers || {}),
        ...(accessToken ? { 'dodao-auth-token': accessToken } : {}),
      } as Record<string, string>;

      try {
        const requestInfo: RequestInit = {
          ...memoizedOptions,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          method: 'DELETE',
        };

        const response = await fetch(url, requestInfo);
        setLoading(false);

        if (!response.ok) {
          const errorText = await response.text();
          setError(errorText);
          return;
        }

        // Handle cases where response might not have a JSON body
        let responseData: RESPONSE_TYPE | undefined = undefined;
        try {
          responseData = await response.json();
        } catch {
          // If response has no content (204 No Content), this will fail silently
        }

        setData(responseData);

        // Show success notification if provided
        if (updateOptions.successMessage) {
          showNotification({ type: 'success', message: updateOptions.successMessage });
        }

        if (updateOptions.redirectPath) {
          await router.push(updateOptions.redirectPath);
        }

        return responseData;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Unable to delete data at ${url}:`, errorMessage);

        setError(errorMessage);
        setLoading(false);

        // Show error notification if provided
        if (updateOptions.errorMessage) {
          showNotification({ type: 'error', message: updateOptions.errorMessage });
        }

        return undefined;
      }
    },
    [memoizedOptions, updateOptions, showNotification]
  );

  return {
    deleteData,
    loading,
    data,
    error,
  };
};
