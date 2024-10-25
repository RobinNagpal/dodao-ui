'use client';

import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface UpdateDataOptions {
  successMessage: string;
  errorMessage: string;
  redirectPath?: string;
}

export const useFetchUtils = () => {
  const { showNotification } = useNotificationContext();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchData = async <T>(url: string, errorMessage: string, options: RequestInit = {}): Promise<T | undefined> => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      };
      if (localStorage.getItem('token')) {
        headers['dodao-auth-token'] = `${localStorage.getItem(DODAO_ACCESS_TOKEN_KEY)}`;
      }
      const response = await fetch(url, {
        headers,
        ...options,
      });

      setLoading(false);
      if (!response.ok) {
        showNotification({ type: 'error', message: errorMessage });
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      setLoading(false);
      showNotification({ type: 'error', message: errorMessage });
      throw error;
    }
  };

  const updateDataGeneric = async <T, X>(
    url: string,
    options: Omit<RequestInit, 'body'> & { body: X },
    updateOptions: UpdateDataOptions
  ): Promise<T | undefined> => {
    const { successMessage, errorMessage, redirectPath } = updateOptions;
    setUpdating(true);
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

      setUpdating(false);
      if (!response.ok) {
        console.error(`Not able to update data at ${url}`, response);
        showNotification({ type: 'error', message: errorMessage });
        return;
      }
      showNotification({ type: 'success', message: successMessage });
      if (redirectPath) {
        await router.push(redirectPath);
      }
      return await response.json();
    } catch (error) {
      setUpdating(false);
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

  return { fetchData, putData, postData, loading, updating };
};
