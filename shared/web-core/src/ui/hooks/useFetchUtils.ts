'use client';

import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { UpdateDataOptions } from '@dodao/web-core/ui/hooks/fetch/UpdateDataOptions';
import { useRouter } from 'next/navigation';

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
