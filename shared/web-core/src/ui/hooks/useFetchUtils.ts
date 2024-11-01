'use client';

import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import isEqual from 'lodash/isEqual';

export interface UpdateDataOptions {
  successMessage?: string;
  errorMessage: string;
  redirectPath?: string;
}

export interface UseFetchDataResponse<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  reFetchData: () => Promise<T | undefined>;
}

function useDeepCompareMemoize<T>(value: T): T {
  const ref = useRef<T>();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current as T;
}

export const useFetchData = <T>(url: string, options: RequestInit & { skipInitialFetch?: boolean } = {}, errorMessage: string): UseFetchDataResponse<T> => {
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
    await fetchData();
    return data;
  }, [fetchData]);
  return {
    data,
    error,
    loading,
    reFetchData,
  };
};

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

export const useFetchUtils = () => {
  const { showNotification } = useNotificationContext();
  const router = useRouter();

  const updateDataGeneric = async <T, X>(
    url: string,
    options: Omit<RequestInit, 'body'> & { body: X },
    updateOptions: UpdateDataOptions
  ): Promise<T | undefined> => {
    const { successMessage, errorMessage, redirectPath } = updateOptions;
    const accessToken = localStorage.getItem(DODAO_ACCESS_TOKEN_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
      ...(accessToken ? { 'dodao-auth-token': accessToken } : {}),
    };

    try {
      const requestInfo = {
        ...options,
        headers,
        body: JSON.stringify(options.body),
      };
      const response = await fetch(url, requestInfo);

      if (!response.ok) {
        console.error(`Not able to update data at ${url}`, response);
        showNotification({ type: 'error', message: errorMessage });
        return;
      }

      if (successMessage) {
        showNotification({ type: 'success', message: successMessage });
      }

      if (redirectPath) {
        await router.push(redirectPath);
      }
      return await response.json();
    } catch (error) {
      console.error(`Not able to update data at ${url}`, error);
      showNotification({ type: 'error', message: errorMessage });
      throw error;
    }
  };

  const putData = async <T, X>(url: string, body: X, updateOptions: UpdateDataOptions): Promise<T | undefined> => {
    return updateDataGeneric<T, X>(
      url,
      {
        method: 'PUT',
        body,
      },
      updateOptions
    );
  };

  const postData = async <T, X>(url: string, body: X, updateOptions: UpdateDataOptions): Promise<T | undefined> => {
    return updateDataGeneric<T, X>(
      url,
      {
        method: 'POST',
        body,
      },
      updateOptions
    );
  };

  return { putData, postData };
};
