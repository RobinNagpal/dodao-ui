import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useRouter } from 'next/router';

export interface FetchDataOptions {
  successMessage: string;
  errorMessage: string;
}

export interface UpdateDataOptions {
  successMessage: string;
  errorMessage: string;
  redirectPath?: string;
}

export const useFetchUtils = () => {
  const { showNotification } = useNotificationContext();
  const router = useRouter();

  const fetchData = async <T>(url: string, errorMessage: string, options: RequestInit = {}): Promise<T | undefined> => {
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
        showNotification({ type: 'error', message: errorMessage });
      }

      return await response.json();
    } catch (error) {
      console.error(error);
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
    try {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
        body: JSON.stringify(options.body),
      });

      if (!response.ok) {
        showNotification({ type: 'error', message: errorMessage });
      }
      showNotification({ type: 'success', message: successMessage });
      if (redirectPath) {
        await router.push(redirectPath);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: errorMessage });
      throw error;
    }
  };

  const updateData = async <T, X>(url: string, body: X, updateOptions: UpdateDataOptions): Promise<T | undefined> => {
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

  return { fetchData, updateData, postData };
};
